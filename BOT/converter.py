def color(text, color):
	return (color+"{}\033[0m".format(text))
def red(text):
	return ("\033[31m{}\033[0m".format(text))
def yellow(text):
	return ("\033[33m{}\033[0m".format(text))
def blue(text):
	return ("\033[34m{}\033[0m".format(text))
def magenta(text):
	return ("\033[35m{}\033[0m".format(text))
def cyan(text):
	return ("\033[36m{}\033[0m".format(text))

print(cyan("Converter")+": Start")
from pprint import pprint
# Подключение библиотек
import httplib2 # Работа с http адресами
import apiclient.discovery
import json # для работы с json файлом
import time # Для работы с временем и функции sleep
from oauth2client.service_account import ServiceAccountCredentials # 
personJson='./DATA/person_table.json'
CREDENTIALS_FILE='./BOT/GTR.json'# файл с данными для входа
spreadsheet_id='1hsmUlcBQ7vlSxi_SbN-oPQmXkYmAAWfJzYVaxJG9kcc'# айди таблицы
# googleTable:  1hsmUlcBQ7vlSxi_SbN-oPQmXkYmAAWfJzYVaxJG9kcc
# https://docs.google.com/spreadsheets/d/1hsmUlcBQ7vlSxi_SbN-oPQmXkYmAAWfJzYVaxJG9kcc/edit?usp=sharing
print(cyan("Converter")+": Libraries are loaded")
hasError=False
while not(hasError):
	credentials=ServiceAccountCredentials.from_json_keyfile_name( # вход
		CREDENTIALS_FILE,
		['https://www.googleapis.com/auth/spreadsheets', # куда войти
		 'https://www.googleapis.com/auth/drive'])
	httpAuth=credentials.authorize(httplib2.Http()) # потключение
	try:
		service=apiclient.discovery.build('sheets', 'v4', http=httpAuth)
		if(not service):
			raise
	except:
		print(cyan("Converter")+": "+red("Connect Error"))
	else:
		print(cyan("Converter")+": Connect google table")
	while not(hasError):
		try:
			values=service.spreadsheets().values().get( # получение таблицы
				spreadsheetId=spreadsheet_id,
				range='A1:F300', # с какой по какую ячейку смотреть
				majorDimension='ROWS' # смотреть по колоннам(COLUMNS) или по рядам(ROWS)
			).execute()
		
			table=values["values"]
			propertyPerson=table[0]
			personValue=table[1:]
			
			#print(personValue) # выводим в консоль
			#pprint(table)
			persons=[]
			i=0
			#print(personValue, propertyPerson)
			print(cyan("Converter")+": Update{"+magenta(time.asctime())+"}")
			for valueS in personValue:
				j=0
				persons.append({"№": "~", "full_name": "~ ~ ~", "mail": "~", "position": "~", "club": "~", "direction": "~"})
				for property in propertyPerson:
					if(not len(valueS)==6):
						#print(valueS)
						#print("!!!\ni:", i, "\nj:", j)
						continue
					#print(property, valueS[j])
					if(not valueS[j]=='~'):
						persons[i][property]=valueS[j]
					j+=1
				if(persons[i]['№']=='~'):
					persons.pop(i)
					i-=1
				i+=1
			#pprint(persons)
			with open(personJson, "w") as f:
				json.dump(persons, f)
			time.sleep(120)
		except IndexError as err:
			print(cyan("Converter")+": "+red("Google Table Error"))
			pprint(err)
		except KeyboardInterrupt:
			print(cyan("\nConverter")+": Exit")
			hasError=True
		except BaseException as err:
			hasError=True
			print(cyan("Converter")+": "+red("Error\n"), err)
print(cyan("Converter")+": Stop")