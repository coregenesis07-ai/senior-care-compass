"""Report official CMS catalog metadata; never modify or deploy data."""
import json
import urllib.request
from urllib.parse import urlparse

IDS = {"hospitals":"xubh-q36u","nursingHomes":"4pq5-n9py","medicalEquipment":"ct36-nrcq"}
URL = "https://data.cms.gov/provider-data/api/1/metastore/schemas/dataset/items/"
for category, identifier in IDS.items():
    req = urllib.request.Request(URL + identifier, headers={"Accept":"application/json","User-Agent":"SeniorCareCompass/1.0"})
    with urllib.request.urlopen(req, timeout=45) as response:
        data = json.load(response)
    if not isinstance(data, dict):
        raise ValueError(category + ": unexpected catalog response")
    links = []
    for item in data.get("distribution", []):
        link = item.get("downloadURL", "")
        parsed = urlparse(link)
        if parsed.scheme == "https" and parsed.hostname == "data.cms.gov" and parsed.path.lower().endswith(".csv"):
            links.append(link)
    if not links:
        raise ValueError(category + ": no official CSV links")
    print(json.dumps({"category":category,"identifier":identifier,"modified":data.get("modified"),"issued":data.get("issued"),"csv":links}))
