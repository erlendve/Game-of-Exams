import os
trans = []
normal = []
for files in os.listdir("."):
	if "trans" in files:
		trans.append(files)
	elif "png" in files:
		normal.append(files)

print trans
print normal
print len(trans)
print len(normal)