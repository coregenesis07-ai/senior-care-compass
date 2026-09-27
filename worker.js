const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=300",
  "x-content-type-options": "nosniff"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function safeFetchJson(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "SeniorCareCompass/1.0"
      },
      signal: controller.signal
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function cmsUrl(datasetId, zip) {
  const url = new URL(
    "https://data.cms.gov/provider-data/api/1/datastore/query/" + datasetId + "/0"
  );
  url.searchParams.set("limit", "12");
  url.searchParams.set("offset", "0");
  url.searchParams.set("conditions[0][property]", "zip_code");
  url.searchParams.set("conditions[0][value]", zip);
  url.searchParams.set("conditions[0][operator]", "=");
  return url.toString();
}

function cmsDmeUrl(zip) {
  const url = new URL(
    "https://data.cms.gov/provider-data/api/1/datastore/query/ct36-nrcq/0"
  );
  url.searchParams.set("limit", "24");
  url.searchParams.set("offset", "0");
  url.searchParams.set("conditions[0][property]", "practicezip9code");
  url.searchParams.set("conditions[0][value]", zip + "%");
  url.searchParams.set("conditions[0][operator]", "LIKE");
  return url.toString();
}

function npiUrl(zip) {
  const url = new URL("https://npiregistry.cms.hhs.gov/api/");
  url.searchParams.set("version", "2.1");
  url.searchParams.set("enumeration_type", "NPI-2");
  url.searchParams.set("address_purpose", "LOCATION");
  url.searchParams.set("country_code", "US");
  url.searchParams.set("postal_code", zip);
  url.searchParams.set("limit", "100");
  return url.toString();
}

function normalizeHospital(row) {
  return {
    id: row.facility_id || "",
    name: row.facility_name || "",
    address: [row.address, row.citytown, row.state, row.zip_code]
      .filter(Boolean)
      .join(", "),
    phone: row.telephone_number || "",
    subtype: row.hospital_type || "Hospital",
    rating: row.hospital_overall_rating || ""
  };
}

function normalizeNursing(row) {
  return {
    id: row.cms_certification_number_ccn || "",
    name: row.provider_name || "",
    address: [row.provider_address, row.citytown, row.state, row.zip_code]
      .filter(Boolean)
      .join(", "),
    phone: row.telephone_number || "",
    subtype: row.provider_type || "Nursing home / rehab",
    rating: row.overall_rating || ""
  };
}

function normalizeSupplierPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length <= 10) return digits;
  return digits.slice(0, 10) + " ext " + digits.slice(10);
}

function normalizeDme(row) {
  const supplies = String(row.supplieslist || "")
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);

  return {
    id: String(row.provider_id || ""),
    name: row.practicename || row.businessname || "Medicare equipment supplier",
    address: [
      row.practiceaddress1,
      row.practiceaddress2,
      row.practicecity,
      row.practicestate,
      row.practicezip9code ? String(row.practicezip9code).slice(0, 5) : ""
    ]
      .filter(Boolean)
      .join(", "),
    phone: normalizeSupplierPhone(row.telephonenumber),
    subtype:
      row.providertypelist ||
      row.specialitieslist ||
      "Medicare medical equipment supplier",
    assignment:
      String(row.acceptsassignement).toLowerCase() === "true"
        ? "yes"
        : "ask",
    supplies: supplies.slice(0, 6).join(" • "),
    rating: ""
  };
}

function npiAddress(record) {
  const addresses = Array.isArray(record.addresses) ? record.addresses : [];
  return (
    addresses.find((a) => a.address_purpose === "LOCATION") ||
    addresses[0] ||
    {}
  );
}

function normalizeNpi(record) {
  const basic = record.basic || {};
  const address = npiAddress(record);
  const taxonomies = Array.isArray(record.taxonomies) ? record.taxonomies : [];
  const primary = taxonomies.find((t) => t.primary) || taxonomies[0] || {};

  const name =
    basic.organization_name ||
    [basic.first_name, basic.last_name].filter(Boolean).join(" ") ||
    "Healthcare organization";

  const zipCode = address.postal_code
    ? String(address.postal_code).slice(0, 5)
    : "";

  return {
    id: String(record.number || ""),
    name,
    address: [
      address.address_1,
      address.address_2,
      address.city,
      address.state,
      zipCode
    ]
      .filter(Boolean)
      .join(", "),
    phone: address.telephone_number || "",
    subtype: primary.desc || "Healthcare organization",
    rating: "",
    zipCode,
    taxonomyText: taxonomies
      .map((t) => String(t.desc || "").toLowerCase())
      .join(" | ")
  };
}

function dedupe(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = [
      String(item.name || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
      String(item.address || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    ].join("|");

    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function splitNpi(records, zip) {
  const clinics = [];
  const pharmacies = [];
  const vision = [];

  for (const record of records) {
    const item = normalizeNpi(record);

    // NPPES may match a different address on the record. Only expose the
    // LOCATION address when it truly matches the ZIP the user entered.
    if (item.zipCode !== zip) continue;

    const tax = item.taxonomyText;

    if (/pharmacy|pharmacist/.test(tax)) {
      pharmacies.push(item);
      continue;
    }

    if (
      /optometrist|ophthalmology|ophthalmic|optician|eyewear|vision therapy/.test(
        tax
      )
    ) {
      vision.push(item);
      continue;
    }

    if (
      /clinic|center|health service|family medicine|internal medicine|primary care|geriatric|community health|urgent care/.test(
        tax
      )
    ) {
      clinics.push(item);
    }
  }

  const strip = (item) => {
    const { taxonomyText, zipCode, ...publicItem } = item;
    return publicItem;
  };

  return {
    clinics: dedupe(clinics).slice(0, 8).map(strip),
    pharmacies: dedupe(pharmacies).slice(0, 8).map(strip),
    vision: dedupe(vision).slice(0, 8).map(strip)
  };
}

async function handleProviders(request) {
  const requestUrl = new URL(request.url);
  const zip = (requestUrl.searchParams.get("zip") || "").trim();

  if (!/^\d{5}$/.test(zip)) {
    return json({ error: "Enter a valid 5-digit U.S. ZIP code." }, 400);
  }

  const zipUrl =
    "https://api.zippopotam.us/us/" + encodeURIComponent(zip);

  const [zipData, hospitalData, nursingData, dmeData, npiData] = await Promise.all([
    safeFetchJson(zipUrl),
    safeFetchJson(cmsUrl("xubh-q36u", zip)),
    safeFetchJson(cmsUrl("4pq5-n9py", zip)),
    safeFetchJson(cmsDmeUrl(zip)),
    safeFetchJson(npiUrl(zip))
  ]);

  const place =
    zipData && Array.isArray(zipData.places) ? zipData.places[0] : null;

  const location = {
    zip,
    city: place ? place["place name"] || "" : "",
    state: place
      ? place["state abbreviation"] || place.state || ""
      : ""
  };

  const hospitals = Array.isArray(hospitalData?.results)
    ? hospitalData.results
        .map(normalizeHospital)
        .filter((x) => x.name)
    : [];

  const nursingHomes = Array.isArray(nursingData?.results)
    ? nursingData.results
        .map(normalizeNursing)
        .filter((x) => x.name)
    : [];

  const medicalEquipment = Array.isArray(dmeData?.results)
    ? dedupe(
        dmeData.results
          .map(normalizeDme)
          .filter((x) => x.name)
      ).slice(0, 10)
    : [];

  const npiRecords = Array.isArray(npiData?.results)
    ? npiData.results
    : [];

  const { clinics, pharmacies, vision } = splitNpi(npiRecords, zip);

  if (!zipData && !hospitalData && !nursingData && !dmeData && !npiData) {
    return json(
      {
        error:
          "Public provider sources are temporarily unavailable. Please use the official resource links on the page."
      },
      503
    );
  }

  return json({
    location,
    hospitals,
    nursingHomes,
    clinics,
    pharmacies,
    vision,
    medicalEquipment,
    sourcesAvailable: {
      zip: Boolean(zipData),
      cmsHospitals: Boolean(hospitalData),
      cmsNursingHomes: Boolean(nursingData),
      cmsMedicalEquipment: Boolean(dmeData),
      nppes: Boolean(npiData)
    },
    notices: [
      "Results are exact-ZIP matches, not a radius search.",
      "CMS/NPPES listings do not guarantee current hours, availability, licensure, credentials, insurance participation, or eligibility.",
      "For medical equipment, confirm the exact item, Medicare enrollment, assignment status, coverage, rental/purchase terms, and availability directly with the supplier and Medicare.",
      "Issuance of an NPI does not by itself validate licensure or credentials."
    ]
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/providers") {
      if (request.method === "GET") {
        return handleProviders(request);
      }

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: JSON_HEADERS
        });
      }

      return json({ error: "Method not allowed." }, 405);
    }

    return env.ASSETS.fetch(request);
  }
};