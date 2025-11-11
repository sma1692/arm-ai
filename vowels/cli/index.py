__author__ = 'S.M:A'


import getpass
import json



# from vowels.encryption import *
# from vowels.emailer import *
from consonants.generator.video_one import v1_cli
from consonants.generator.text.cli import cli_interface as t_cli
from consonants.generator.image_one.cli import cli_interface as i_cli


from application.scripts.utils import fastapp_cli

def cli_utility(cli_args):
    print("ARGUMENTS GOT ", cli_args)
    if len(cli_args) == 1:
        pass  ## an add logic for dynamic cli
    else:
        operation = cli_args[1]
        print("OPERATION ", operation)
        if operation[0] == "f":
            fastapp_cli(operation)
        if operation[0] == "v":
            v1_cli(operation)
        
        if operation[0] == "t":
            t_cli(operation)
        if operation[0] == "i":
            i_cli(operation)
            