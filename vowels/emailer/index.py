__author__ = 'S.M:A'


import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_ID, EMAIL_PWD, DEFAULT_RECEIVERS



# Create message
def send_email(message, subject="tempramental1", receiver_email=DEFAULT_RECEIVERS,  sender=EMAIL_ID, pwd=EMAIL_PWD ):
    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = ", ".join(receiver_email)
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    # print ("msg", msg, DEFAULT_RECEIVERS, type(DEFAULT_RECEIVERS))
    # print("DEEEEED >>>>>>> ", DEFAULT_RECEIVERS)
    
    
    
    # server = smtplib.SMTP('smtp-mail.outlook.com', 587)
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(sender, pwd)

    # Send email
    sended = server.sendmail(sender, receiver_email, msg.as_string())
    print("SEND EMAIL ", sended)
    # Quit server
    server.quit()
