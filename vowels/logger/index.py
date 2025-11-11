import logging
from logging.handlers import TimedRotatingFileHandler
import datetime
import os
from colorama import Fore, Style, init
from config import dir_path

# Initialize colorama
init(autoreset=True)

class ColoredFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': Fore.CYAN,
        'INFO': Fore.GREEN,
        'WARNING': Fore.YELLOW,
        'ERROR': Fore.RED,
        'CRITICAL': Fore.MAGENTA,
    }

    def format(self, record):
        log_color = self.COLORS.get(record.levelname, "")
        reset = Style.RESET_ALL
        message = super().format(record)
        return f"{log_color}{message}{reset}"

# Ensure the log directory exists
log_directory = str(dir_path) + "/files/logs"
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

# Define the log file path
str_date = datetime.datetime.now().strftime('%Y%m%d')
file_name = '%s_%s.log' % ("LIPI_LOG", str_date)
log_file_path = os.path.join(log_directory, file_name)

# Function to get logger with a custom name
def get_logger(name="Q_LOG"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)  # Set the log level

    # Create a handler for writing log messages to a file with daily rotation
    handler = TimedRotatingFileHandler(
        log_file_path, when="midnight", interval=1, backupCount=70
    )
    
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Optional: Add a console handler if you also want to log to the console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger
