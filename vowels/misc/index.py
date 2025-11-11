__author__ = 'S.M:A'


import hashlib, time
from collections import Counter

def chunk_list(_list, no_of_chunks):
    masterList = [[] for i in range(no_of_chunks)]
    for ind, i in enumerate(_list):
        masterList[ind%no_of_chunks].append(i)
    return masterList



def get_color_code(input_string):
    byte_string = input_string.encode('utf-8')
    hash_value = hashlib.sha256(byte_string).hexdigest()
    color_code = '#' + hash_value[:6]
    return color_code

def sleeper(seconds, _id="none"):
    print("SLEEPER Class Tatkal Waiting time {} Seconds {}".format(seconds, _id))
    time.sleep(seconds)
    print("Wake Up!!! ", _id)




def get_all_collection_doc_counts(db):
    ### for pymongo db object, gets all collections and counters
    counter = {}
    collections = db.list_collection_names()
    for collection in collections:
        counter[collection] = db[collection].count_documents({})
    return counter

def print_lists_lens(list_of_lists):
    for index, item in enumerate(list_of_lists):
        print(f"-- {index} : {type(item)} Length {len(item)}")


