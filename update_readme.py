import re
import os
import shutil




class Command:
	def __init__(self, cmd:str):
		self.cmd:str = cmd
		self.args:str = ''
		self.hint:str = ''
		self.examples:list[str] = []
	def __str__(self):
		return self.cmd
	def __repr__(self):
		return self.cmd

re_group = r'^// GROUP: (.+?)\n?$'
re_start = r'^SlashCommandParser\.addCommandObject\(SlashCommand\.fromProps\(\{\s*name:\s*\'([^\']+)\',\n$'
re_hint = r'^\s*helpString:\s*(?P<quote>["\'`])(?P<hint>.*?)(?P=quote),\n$'
re_mhint = r'^\s*helpString:\s*`\s*\n$'


with open(os.path.join(os.path.dirname(__file__), 'index.js'), 'r', encoding='utf-8') as f:
	lines = f.readlines()

cmd_list:dict[str,Command] = {}
cmd:Command = None
group:str = 'Ungrouped'
is_help = False
for line in lines:
	if re.match(re_group, line):
		group = re.sub(re_group, r'\1', line)
		if group not in cmd_list:
			cmd_list[group] = []
	elif re.match(re_start, line):
		cmd = Command(re.sub(re_start, r'\1', line))
		cmd_list[group].append(cmd)
	elif cmd is not None and re.match(re_hint, line):
		cmd.args = ''
		m = re.match(re_hint, line)
		cmd.hint = m['hint']
		cmd = None
	elif cmd is not None and re.match(re_mhint, line):
		cmd.args = ''
		cmd.hint = ''
		is_help = True
	elif cmd and is_help and line.endswith('`,\n'):
		cmd.hint += line[0:-3]
		cmd.hint = re.sub(r'\s*<div>\n\s*<strong>Example.+?</div>', '', cmd.hint, flags=re.DOTALL)
		cmd.hint = re.sub(r'(^|\n)\s+', r'\1', cmd.hint, flags=re.DOTALL)
		is_help = False
		cmd = None
	elif cmd and is_help:
		cmd.hint += line

shutil.copy(os.path.join(os.path.dirname(__file__), 'README.md'), os.path.join(os.path.dirname(__file__), 'README.bak.md'))
with open(os.path.join(os.path.dirname(__file__), 'README.md'), 'r', encoding='utf-8') as f:
	readme = f.readlines()
group = None
cmd = None
in_example:bool = False
ex:str = ''
req:str = ''
req_start = False
req_end = False
prev_was_cmd = False
for line in readme:
	if line.startswith('## Requirements'):
		req_start = True
	elif req_start and not req_end:
		if line.startswith('## '):
			req_end = True
		elif len(line.strip()) > 0:
			req = req + line
	elif line.startswith('### '):
		group = line.split('### ')[-1].strip()
	elif group and line.startswith('#### '):
		name = line.split('`')[1][1:]
		cmd = [x for x in cmd_list[group] if x.cmd == name][0]
		prev_was_cmd = True
	elif group and cmd and prev_was_cmd and line[0] == '`' and line[1] != '`':
		cmd.args = line
	elif group and cmd and (line == '```\n' or line == '```stscript\n'):
		if in_example:
			cmd.examples.append(ex)
		in_example = not in_example
		ex = ''
	elif group and cmd and in_example:
		ex += line


with open(os.path.join(os.path.dirname(__file__), 'README.md'), 'w', encoding='utf-8') as f:
	# intro
	f.write('# LALib\n\n')
	f.write('Library of STScript commands.\n\n')
	for group in cmd_list:
		if group in ['Help', 'Undocumented']:
			continue
		f.write('\n')
		f.write(f'- {group} (')
		f.write(', '.join([x.cmd for x in cmd_list[group]]))
		f.write(')')

	# requirements
	f.write('\n'*6)
	f.write('## Requirements\n\n')
	f.write(req)

	# commends
	f.write('\n'*6)
	f.write('## Commands\n\n')
	for group in cmd_list:
		f.write('\n'*6)
		f.write(f'### {group}')
		for cmd in cmd_list[group]:
			f.write('\n'*4)
			f.write(f'#### `/{cmd.cmd}`\n')
			if cmd.args:
				f.write(f'{cmd.args}\n\n')
			f.write(f'{cmd.hint}\n\n')
			f.write('##### Examples\n\n')
			if len(cmd.examples) > 0:
				for ex in cmd.examples:
					f.write('```stscript\n')
					f.write(ex)
					f.write('```\n\n')
			else:
				f.write('```\nsome code here\n```\n\n')
