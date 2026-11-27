"""Build a candidate CMS ZIP snapshot from official CSV files; never deploy."""
import argparse, csv, json, pathlib, re, tempfile, shutil
SOURCES = {
 "hospitals": ("zip_code", "facility_id", "facility_name", "address", "citytown", "state", "telephone_number", "hospital_type", "hospital_overall_rating"),
 "nursingHomes": ("zip_code", "cms_certification_number_ccn", "provider_name", "provider_address", "citytown", "state", "telephone_number", "provider_type", "overall_rating"),
 "medicalEquipment": ("practicezip9code", "provider_id", "practicename", "businessname", "practiceaddress1", "practiceaddress2", "practicecity", "practicestate", "telephonenumber", "specialitieslist", "providertypelist", "acceptsassignement", "supplieslist")
}
MINIMUM = {"hospitals": 4000, "nursingHomes": 10000, "medicalEquipment": 40000}
def key(s):
 normalized = re.sub(r"[^a-z0-9]+", "_", s.strip().lower()).strip("_")
 return {"city_town": "citytown"}.get(normalized, normalized)
def build(paths, output, releases):
 if output.exists(): raise ValueError("Output must be a new candidate directory")
 grouped, counts = {}, {}
 for category, fields in SOURCES.items():
  count = 0
  with paths[category].open(encoding="utf-8-sig", newline="") as f:
   reader = csv.DictReader(f)
   headers = {key(h) for h in reader.fieldnames or []}
   if not set(fields).issubset(headers): raise ValueError(f"{category}: missing columns {set(fields)-headers}")
   for raw in reader:
    row = {key(k): (v or "").strip() for k,v in raw.items() if k is not None}
    z = row[fields[0]]
    if not re.fullmatch(r"[0-9]{5}(?:-?[0-9]{4})?", z): continue
    if not row[fields[1]]: continue
    grouped.setdefault(z[:5], {}).setdefault(category, []).append({k:row[k] for k in fields})
    count += 1
  if count < MINIMUM[category]: raise ValueError(f"{category}: unexpectedly low count {count}")
  counts[category] = count
 output.parent.mkdir(parents=True, exist_ok=True)
 with tempfile.TemporaryDirectory(dir=output.parent) as tmp:
  stage = pathlib.Path(tmp)/"snapshot"
  stage.mkdir()
  for z, data in grouped.items():
   bucket = stage/z[:2]
   bucket.mkdir(exist_ok=True)
   (bucket/(z+".json")).write_text(json.dumps(data,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
  # Keep the validated per-ZIP layout and add a compact deployment candidate.
  compact = stage/"compact"
  compact.mkdir()
  shards = {}
  for z, data in grouped.items():
   shards.setdefault(z[:3], {})[z] = data
  sizes = []
  for prefix, data in shards.items():
   encoded = json.dumps(data,ensure_ascii=False,separators=(",",":")).encode("utf-8")
   if len(encoded) > 10*1024*1024: raise ValueError("Oversized shard: "+prefix)
   (compact/(prefix+".json")).write_bytes(encoded)
   sizes.append(len(encoded))
  reconstructed = {}
  for file in compact.glob("*.json"):
   reconstructed.update(json.loads(file.read_text(encoding="utf-8")))
  if reconstructed != grouped: raise ValueError("Compact snapshot differs from validated ZIP records")
  (compact/"manifest.json").write_text(json.dumps({"format":1,"counts":counts,"releases":releases,"zipCount":len(grouped),"shardCount":len(shards),"totalBytes":sum(sizes),"largestShardBytes":max(sizes)},indent=2),encoding="utf-8")
  print((compact/"manifest.json").read_text())
  (stage/"manifest.json").write_text(json.dumps({"counts":counts,"releases":releases,"zipCount":len(grouped)},indent=2),encoding="utf-8")
  stage.rename(output)
 return counts
if __name__ == "__main__":
 p=argparse.ArgumentParser()
 for category in SOURCES:
  p.add_argument("--"+category, type=pathlib.Path, required=True)
  p.add_argument("--"+category+"-release", required=True)
 p.add_argument("--output",type=pathlib.Path,required=True)
 a=vars(p.parse_args())
 import datetime
 releases={k:a[k+"_release"] for k in SOURCES}
 for date in releases.values(): datetime.date.fromisoformat(date)
 print(build({k:a[k] for k in SOURCES},a["output"],releases))
