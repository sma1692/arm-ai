__author__ = 'S.M:A'


from functools import wraps
import time



def timer_(func):
    def timed(*args, **kwargs):
        st = time.time()
        result = func(*args, **kwargs)
        te = time.time() - st
        f_name = func.__name__
        print('TEEE ><><>< Function', f_name, 'time:', te)
        # global time_stats
        # if time_stats.__contains__(f_name):
        #     pass
        # print()
        # db["timed"].insert({"function": func.__name__, "time": te})
        return result

    return timed




def ask_confirmation(func):
    def confirm(*args, **kwargs):
        st = time.time()
        print('Confirmation Before Function', func.__name__)
        cont = input("Continue ? (Yes)\n")
        if cont not in ["Yes", "yes"]:
            return False
        result = func(*args, **kwargs)
        return result
    return confirm



def error_decorator(errors=(Exception,), default_value=''):
    def decorator(func):
        @wraps(func)
        def new_func(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print("------Error in function ", func.__name__, e)
                exc_type, exc_obj, exc_tb = sys.exc_info()
                print("E=%s, F=%s, L=%s" % (
                str(e), traceback.extract_tb(exc_tb)[-1][0], traceback.extract_tb(exc_tb)[-1][1]))

        return new_func

    return decorator





handler_ = error_decorator((KeyError, NameError, IndexError, Exception), default_value='default')