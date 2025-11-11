from collections import Counter

def count_values_of_dict(_dict):
    # Given dictionary
    data = {"abc": "1", "a": "2", "b": "1"}
    # Extract the values from the dictionary
    values = _dict.values()
   # Count the occurrences of each value
    counter = Counter(values)
    # Sort by frequency in descending order
    sorted_ids = [item for item, _ in counter.most_common()]
    print(sorted_ids)
    return sorted_ids



def id_mapper(dict_list, key_="_id"):
    ### converts a given list of  jsons to a map with key_ as id 
    ### assuming htere are no repetitions for the keys
    mapped = { str(i[key_]): i for i in dict_list }
    return mapped

def multi_val_id_mapper(dict_list, key_):
    """
    this takes care of repetetion of keys to avoid overwriting in the final map
    """
    final_map = {}
    for _dict in dict_list:
        if final_map.__contains__(str(_dict[key_])):
            final_map[str(_dict[key_])].append(_dict)
        else:
            final_map[str(_dict[key_])] = [ _dict ]
    return final_map

def counter_mapper(forward_map):
    """
    for a single key vs value dict, creates the counter map
    chances of multiple values, hence creating an array in counter map
    """
    reverse_map = {}
    for key, value in forward_map.items():
        if reverse_map.__contains__(value):
            reverse_map[value].append(key)
        else:
            reverse_map[value] = [ key ]
    return reverse_map

def single_counter_mapper(forward_map):
    """
    for a single key vs value dict, creates the counter map
    one to one map necessary
    """
    reverse_map = {}
    for key, value in forward_map.items():
        reverse_map[value] = key 
    return reverse_map



class DotDict(dict):
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(f"'DotDict' object has no attribute '{key}'")

    def __setattr__(self, key, value):
        self[key] = value

    def __delattr__(self, key):
        try:
            del self[key]
        except KeyError:
            raise AttributeError(f"'DotDict' object has no attribute '{key}'")

# # Example usage
# diction = DotDict({'somekey': 'value'})
# print(diction.somekey)  # Output: value
# diction.newkey = 'new value'
# print(diction.newkey)   # Output: new value
