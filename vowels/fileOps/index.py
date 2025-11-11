
import os, sys, shutil, traceback
import subprocess
from functools import wraps
import zipfile

from config import dir_path



class FileOperator(object):
    def __init__(self):
        self.folder_heirarchy = {
            "files": {
                "excel": { 
                    "dataset": {},
                    "output": {},
                    "interim": {},
                }, 
                "reports": {
                    
                },
                "logs": {},
                "dataset":{
                    'ps03': {
                        
                    }
                },
                "plots": {
                    
                },
                "models": {
                    
                },
                "archive": {},
                "tokenizers": {

                }
            }
        }
        
        self.root_public = "files"
        self.excel_folder = "excel"
        self.log_folder = "logs"
        self.zip_folder = "zips"
        self.reports_folder = "reports"
        self.level_one_folders = [self.log_folder, self.excel_folder, self.zip_folder, self.reports_folder]
        self.vas_reports = "VAS"
        self.discount_reports = "Discount"
        self.menu_reports = "Menu"
        self.delfee_reports = "DelFee"
        
        self.level_two_reports = [self.vas_reports, self.delfee_reports, self.discount_reports, self.menu_reports]
        # self.directory_ops()
        self.create_folders_from_dict(self.folder_heirarchy)
        
    def create_folders_from_dict(self, folder_structure, base_path=os.getcwd()):
        for folder, subfolders in folder_structure.items():
            folder_path = os.path.join(base_path, folder)
            os.makedirs(folder_path, exist_ok=True)  # Create the folder if it doesn't exist
            
            # Recursively create subfolders if the value is a non-empty dict
            if isinstance(subfolders, dict) and subfolders:
                self.create_folders_from_dict(subfolders ,folder_path )
        
    def makeDirectory(self, _dirnames):
        for __dir in _dirnames:
            try:
                _dir = "%s/%s" % (dir_path, __dir)
                os.mkdir(_dir)
            except Exception as e:
                pass
                # print(".")

    def move_file(self, fname, destination):
        try:
            shutil.move(fname, destination)
        except Exception as e:
            print(("Fata in move_file", e))

    def directory_ops(self):
        #parent public folder
        self.makeDirectory([self.root_public])
        # level 1 folders
        fnames = ["{}/{}".format(self.root_public, i) for i in self.level_one_folders]
        self.makeDirectory(fnames)
        # level 2 reports folders
        fnames = ["{}/{}/{}".format(self.root_public, self.reports_folder, i) for i in self.level_two_reports]
        self.makeDirectory(fnames)
        # level 2 zip folders
        fnames = ["{}/{}/{}".format(self.root_public, self.zip_folder, i) for i in self.level_two_reports]
        self.makeDirectory(fnames)
        contents = os.listdir(dir_path)
        # print(("contents", contents))
        for i in contents:
            if ".xls" in i:
                _src = "{}/{}".format(dir_path, i)
                _dest = "{}/{}/{}/{}".format(dir_path, self.root_public, self.excel_folder, i)
                self.move_file(_src, _dest)
            if "log" in i:
                _src = "{}/{}".format(dir_path, i)
                _dest = "{}/{}/{}/{}".format(dir_path, self.root_public, self.log_folder, i)
                self.move_file(_src, _dest)
            if ".zip" in i:
                _src = "{}/{}".format(dir_path, i)
                _dest = "{}/{}/{}/{}".format(dir_path, self.root_public, self.zip_folder, i)
                self.move_file(_src, _dest)

    def check_file(self, fname, directory):
        contents = os.listdir(directory)
        # print(directory, contents)
        if fname not in contents:
            return False
        else:
            return True

    def make_zipfile(self, source_dir, dest_dir):
        relroot = os.path.abspath(os.path.join(source_dir, os.pardir))
        with zipfile.ZipFile(dest_dir, "w", zipfile.ZIP_DEFLATED) as zip:
            for root, dirs, files in os.walk(source_dir):
                zip.write(root, os.path.relpath(root, relroot))
                for file in files:
                    filename = os.path.join(root, file)
                    if os.path.isfile(filename):
                        arcname = os.path.join(os.path.relpath(root, relroot), file)
                        zip.write(filename, arcname)




