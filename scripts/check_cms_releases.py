"""Report official CMS catalog metadata; never modify or deploy data."""
import json
import urllib.request
from urllib.parse import urlparse

IDS = {"hospitals":"xubh-q36u","nursingHomes":"4pq5-n9py","medicalEquipment":"ct36-nrcq"}
CURRENT = {"hospitals":"https://data.cms.gov/provider-data/sites/default/files/resources/d3bf87c5505155f549d603688414f3c6_1793059553/Hospital_General_Information_2.csv","nursingHomes":"https://data.cms.gov/provider-data/sites/default/files/resources/0970c657767e40f8521187d02ba8d0ed_1792181744/NH_ProviderInfo_Oct2026.csv","medicalEquipment":"https://data.cms.gov/provider-data/sites/default/files/resources/3b76abb9b6f610373563b5ef08bb0d81_1795306515/Medical-Equipment-Suppliers.csv"}
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
    print(json.dumps({"category":category,"identifier":identifier,"modified":data.get("modified"),"issued":data.get("issued"),"csv":links,"reviewRequired":CURRENT[category] not in links or len(links)!=1}))
