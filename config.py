__author__ = 'S.M:A'


# import redis
import datetime
from dotenv import load_dotenv
import os, ast
# from pymongo import MongoClient
import json
from pathlib import Path
# from vowels.encryption import env_decryptor
# from vowels.encryption import __key



load_dotenv()
def getEnvVariables(varName):
    _val = os.getenv(varName)
    # print 'vaarrr', varName, _val
    if _val or _val == '0':
        return _val
    else:
        errMsg = 'env variable %s is required. Please check .env.example for template' % varName
        raise  Exception(errMsg)


str_date = datetime.datetime.now().strftime('%Y%m%d')


debug = True
production = False

dir_path = Path.cwd()

HFACE_TOKEN = getEnvVariables("HFACE_TOKEN")
# TELEGRAM_TOKEN = getEnvVariables('TELEGRAM_BOT_KEY')
# MONGODB_URI = getEnvVariables('MONGODB_URI')
# DB_NAME = getEnvVariables('DB_NAME')
# # UNAME = json.loads(getEnvVariables('UNAME'))
# GROUP_ID = getEnvVariables('GROUP_ID')

# MAX_PARALLEL = getEnvVariables('MAX_PARALLEL')
# # REMOTE_URL = getEnvVariables('REMOTE_URL')
# REDIS_PREFIX = getEnvVariables('REDIS_PREFIX')
# GECKO_PATH = getEnvVariables('GECKO_PATH')

# PORT = getEnvVariables('PORT')
# PROD = getEnvVariables('PROD')


######SMTP CONFIG
# EMAIL_ID = env_decryptor(getEnvVariables('EMAIL_ID'), __key)
# EMAIL_PWD = env_decryptor(getEnvVariables('EMAIL_PWD'), __key)
# DEFAULT_RECEIVERS1 = getEnvVariables('DEFAULT_RECEIVERS')
# # DEFAULT_RECEIVERS = list(getEnvVariables('DEFAULT_RECEIVERS'))
# DEFAULT_RECEIVERS = ast.literal_eval(getEnvVariables('DEFAULT_RECEIVERS'))

######ORAM-PRIME SETTINGS
# HOT_STRING = getEnvVariables('HOT_STRING')
# ADMIN_SALT = getEnvVariables('ADMIN_SALT')
# GATEWAY_URL = getEnvVariables('GATEWAY_URL')

######### AWS CONFIG 
# REGION = getEnvVariables('REGION')
# SQS_PREFIX = getEnvVariables('SQS_PREFIX')
# ACCESS_KEY_ID_SQS = getEnvVariables('ACCESS_KEY_ID_SQS')
# SECRET_KEY_ID_SQS = getEnvVariables('SECRET_KEY_ID_SQS')




# def redis_conn(ip='127.0.0.1', port=6379):
#     try:
#         r = redis.StrictRedis(host=ip, port=port, db=0)
#         # print "redis connected:", r
#         return r
#     except Exception as e:
#         print "Error in redis connection: ", e





# def db_conn():
#     client = MongoClient(MONGODB_URI)
#     db = client[DB_NAME]
#     return db


class _Config:
    session_collection = "session_data"
    form_fill_collection = "forms_filled"
    up_collection = "up"
    xup_collection = "xup"
    profile_link_collection = "profile_link"
    
