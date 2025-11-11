__author__ = 'S.M:A'


from Crypto.Cipher import AES
import base64, os
import hashlib

def env_encryptor(plaintext, enc_key):
    # @author: Nabhdeep
    if not isinstance(plaintext, bytes) or type(plaintext) != bytes:
        base64_text = bytes(plaintext , 'utf-8')
    else:
        base64_text = plaintext
    password = enc_key #password 
        
    BLOCK_SIZE = 16
    iv = os.urandom(16)
    
    pvt_key = hashlib.sha256(password.encode('utf-8')).digest()
    #print(pvt_key)
    
    #create cipher congfig
    cipher_config = AES.new(pvt_key , AES.MODE_CBC , iv)
    
    #padding lambda function which will pad the last block
    padding = lambda s: s+ (BLOCK_SIZE - len(s)%BLOCK_SIZE)* " ".encode("utf-8")
    #print(padding(base64_text))
    
    res = cipher_config.encrypt(padding(base64_text))
    #print("TYPE RES",type(res),bytes(iv.hex()))
    return (iv.hex()+":"+res.hex())


def env_decryptor(iv_e_data, enc_key):
    # @author: Nabhdeep
    try:
        password = enc_key
        splitData = iv_e_data.split(":")
        e_data  =bytes.fromhex(splitData[1])
        iv= bytes.fromhex(splitData[0]) 
        pvt_key = hashlib.sha256(password.encode('utf-8')).digest()
        decipher_config = AES.new(pvt_key , AES.MODE_CBC , iv)        
        decrypt = decipher_config.decrypt(e_data)
        res = decrypt.decode('utf-8')
        for i , char in enumerate(res[::-1]):
            if(char!=' '):
                pad_idx = i
                break
        res = res[::-1][pad_idx:][::-1]
        return res
    except Exception as e:
        print(f'Error(IV) in Decryption {e} ')
        raise DeprecationWarning