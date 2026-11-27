#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl --fail --location --retry 2 --max-time 180 'https://data.cms.gov/provider-data/sites/default/files/resources/d3bf87c5505155f549d603688414f3c6_1793059553/Hospital_General_Information_2.csv' -o "$tmp/hospitals.csv"
curl --fail --location --retry 2 --max-time 180 'https://data.cms.gov/provider-data/sites/default/files/resources/0970c657767e40f8521187d02ba8d0ed_1792181744/NH_ProviderInfo_Oct2026.csv' -o "$tmp/nursing.csv"
curl --fail --location --retry 2 --max-time 180 'https://data.cms.gov/provider-data/sites/default/files/resources/3b76abb9b6f610373563b5ef08bb0d81_1795306515/Medical-Equipment-Suppliers.csv' -o "$tmp/equipment.csv"
python scripts/build_cms_snapshot.py --hospitals "$tmp/hospitals.csv" --hospitals-release 2026-11-12 --nursingHomes "$tmp/nursing.csv" --nursingHomes-release 2026-10-28 --medicalEquipment "$tmp/equipment.csv" --medicalEquipment-release 2026-11-22 --output "$tmp/candidate"
test -f "$tmp/candidate/compact/manifest.json"
test ! -e public/cms-data || { echo "Existing CMS assets: refusing overwrite"; exit 1; }
mv "$tmp/candidate/compact" public/cms-data
echo "Validated CMS assets prepared for Wrangler."
