import sys
import requests


farm_host = sys.argv[1]
farm_password = sys.argv[2]

url = 'https://scoreboard.ctf.saarland/api/scoreboard_teams.json'

teams = requests.get(url).json()
teams_list = []

for team in teams:
    t = teams.get(team)
    teams_list.append({'team_name': t.get('name'), 'team_ip': t.get('vulnbox')})

r = requests.post(
    f'http://{farm_host}:8893/api/teams',
    json={'teams': teams_list},
    headers={'Authorization': farm_password}
)

print(r.text)
