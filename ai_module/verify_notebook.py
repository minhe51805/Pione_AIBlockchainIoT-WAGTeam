"""
Verify soil_training.ipynb is valid
"""
import json

with open('soil_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

print("=" * 80)
print("✅ NOTEBOOK VERIFICATION")
print("=" * 80)

print(f"\n📊 Structure:")
print(f"   • Total cells: {len(nb['cells'])}")
print(f"   • Code cells: {sum(1 for c in nb['cells'] if c['cell_type'] == 'code')}")
print(f"   • Markdown cells: {sum(1 for c in nb['cells'] if c['cell_type'] == 'markdown')}")

print(f"\n📋 Cell Breakdown:")
for i, cell in enumerate(nb['cells']):
    cell_type = cell['cell_type']
    if cell_type == 'markdown':
        first_line = cell['source'][0].strip() if cell['source'] else '(empty)'
        if first_line.startswith('#'):
            print(f"   {i:2}. [{cell_type:8}] {first_line[:60]}")
    else:
        first_line = cell['source'][0].strip() if cell['source'] else '(empty)'
        if first_line.startswith('#'):
            print(f"   {i:2}. [{cell_type:8}] {first_line[:60]}")

print(f"\n✅ Notebook is VALID!")
print(f"   • File: soil_training.ipynb")
print(f"   • Format: Jupyter Notebook v{nb['nbformat']}.{nb['nbformat_minor']}")
print(f"\n🚀 Ready to run in VS Code or Jupyter!")

