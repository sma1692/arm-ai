__author__ = 'S.M:A'

# import boto3
from vowels.cli import *
from vowels.fileOps import *
import atexit
import time, sys
import warnings


def exit_handler():
    print('SCRIPTS is ending!')


start_time = time.time()


if __name__ == '__main__':
    print("starting from main")
    # global time_stats
    # time_stats = {}
    atexit.register(exit_handler)
    warnings.filterwarnings("ignore", category=UserWarning)
    file_obj = FileOperator()
    cli_utility(sys.argv)
    print("--- %s seconds ---" % (time.time() - start_time))
    
