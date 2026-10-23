import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

assets_dir = r'd:\optibuy\report_assets'
os.makedirs(assets_dir, exist_ok=True)

# 1. System Architecture Diagram
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 7)
ax.axis('off')

# Presentation Tier
rect_pres = patches.FancyBboxPatch((0.5, 4.8), 9.0, 1.8, boxstyle="round,pad=0.2", facecolor='#EBF5FB', edgecolor='#2980B9', linewidth=2)
ax.add_patch(rect_pres)
ax.text(5.0, 6.2, 'PRESENTATION TIER (FRONTEND SPA - REACT 18 + VITE + TAILWIND CSS)', fontsize=11, fontweight='bold', ha='center', color='#1B4F72')

# Frontend components
comps = ['Customer Portal\n(Product Search, Comparison,\nMatch Score, EMI Calc)', 'Sales Executive Dashboard\n(Assistance Queue, Product Recs,\nFloor Inventory Monitor)', 'Admin Control Center\n(User Governance, Staff Approvals,\nCatalog & Revenue Analytics)']
for idx, c in enumerate(comps):
    bx = patches.FancyBboxPatch((0.8 + idx*3.0, 4.9), 2.7, 1.1, boxstyle="round,pad=0.1", facecolor='#FFFFFF', edgecolor='#3498DB', linewidth=1.5)
    ax.add_patch(bx)
    ax.text(2.15 + idx*3.0, 5.45, c, fontsize=8.5, ha='center', va='center', color='#2C3E50')

# Arrow
ax.annotate('', xy=(5.0, 4.2), xytext=(5.0, 4.7), arrowprops=dict(arrowstyle="<->", color='#2C3E50', lw=2))
ax.text(5.2, 4.45, 'RESTful API / JSON / JWT Auth', fontsize=8.5, fontweight='bold', color='#2C3E50')

# Application Tier
rect_app = patches.FancyBboxPatch((0.5, 2.3), 9.0, 1.8, boxstyle="round,pad=0.2", facecolor='#EAFaf1', edgecolor='#27AE60', linewidth=2)
ax.add_patch(rect_app)
ax.text(5.0, 3.7, 'APPLICATION LOGIC TIER (NODE.JS + EXPRESS.JS REST API SERVER)', fontsize=11, fontweight='bold', ha='center', color='#145A32')

app_comps = ['Authentication & RBAC\n(JWT, Bcrypt, Google OAuth,\nRole Authorization)', 'Decision Support Engine\n(Multi-Criteria Match Score,\nBudget & Spec Fit Analysis)', 'Business & Order Services\n(Showroom Assistance Queue,\nCatalog CRUD, Sales Logging)']
for idx, c in enumerate(app_comps):
    bx = patches.FancyBboxPatch((0.8 + idx*3.0, 2.4), 2.7, 1.1, boxstyle="round,pad=0.1", facecolor='#FFFFFF', edgecolor='#2ECC71', linewidth=1.5)
    ax.add_patch(bx)
    ax.text(2.15 + idx*3.0, 2.95, c, fontsize=8.5, ha='center', va='center', color='#2C3E50')

# Arrow
ax.annotate('', xy=(5.0, 1.7), xytext=(5.0, 2.2), arrowprops=dict(arrowstyle="<->", color='#2C3E50', lw=2))
ax.text(5.2, 1.95, 'pg Connection Pool (SQL Queries / Parameterized Transactions)', fontsize=8.5, fontweight='bold', color='#2C3E50')

# Data Tier
rect_db = patches.FancyBboxPatch((0.5, 0.2), 9.0, 1.4, boxstyle="round,pad=0.2", facecolor='#FEF9E7', edgecolor='#F39C12', linewidth=2)
ax.add_patch(rect_db)
ax.text(5.0, 1.25, 'DATA TIER (POSTGRESQL RELATIONAL DATABASE - SCHEMAS: OPTIBUY & PUBLIC)', fontsize=11, fontweight='bold', ha='center', color='#7D6608')

db_tables = ['Users & Profiles\n(tbl_users, sales_profiles)', 'Product Catalog\n(tbl_products, categories, brands)', 'Orders & Assistance\n(tbl_orders, assistance_reqs, recs)']
for idx, c in enumerate(db_tables):
    bx = patches.FancyBboxPatch((0.8 + idx*3.0, 0.3), 2.7, 0.8, boxstyle="round,pad=0.1", facecolor='#FFFFFF', edgecolor='#F1C40F', linewidth=1.5)
    ax.add_patch(bx)
    ax.text(2.15 + idx*3.0, 0.7, c, fontsize=8.5, ha='center', va='center', color='#2C3E50')

plt.tight_layout()
plt.savefig(os.path.join(assets_dir, 'architecture_diagram.png'), bbox_inches='tight')
plt.close()
print('Architecture diagram saved.')

# 2. Use Case Diagram
fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

# System Boundary Box
sys_box = patches.FancyBboxPatch((2.2, 0.5), 5.6, 9.0, boxstyle="round,pad=0.2", facecolor='#F8F9F9', edgecolor='#34495E', linewidth=2)
ax.add_patch(sys_box)
ax.text(5.0, 9.15, 'OptiBuy Platform System Boundary', fontsize=12, fontweight='bold', ha='center', color='#2C3E50')

# Actors
# Customer (Left)
ax.plot([1.0], [5.5], marker='o', markersize=14, color='#2980B9')
ax.plot([1.0, 1.0], [4.8, 5.3], color='#2980B9', lw=2)
ax.plot([0.6, 1.4], [5.1, 5.1], color='#2980B9', lw=2)
ax.plot([1.0, 0.7], [4.8, 4.3], color='#2980B9', lw=2)
ax.plot([1.0, 1.3], [4.8, 4.3], color='#2980B9', lw=2)
ax.text(1.0, 4.0, 'Customer', fontsize=10, fontweight='bold', ha='center', color='#1B4F72')

# Sales Executive (Right Top)
ax.plot([9.0], [7.2], marker='o', markersize=14, color='#27AE60')
ax.plot([9.0, 9.0], [6.5, 7.0], color='#27AE60', lw=2)
ax.plot([8.6, 9.4], [6.8, 6.8], color='#27AE60', lw=2)
ax.plot([9.0, 8.7], [6.5, 6.0], color='#27AE60', lw=2)
ax.plot([9.0, 9.3], [6.5, 6.0], color='#27AE60', lw=2)
ax.text(9.0, 5.7, 'Sales Executive', fontsize=10, fontweight='bold', ha='center', color='#145A32')

# Administrator (Right Bottom)
ax.plot([9.0], [2.8], marker='o', markersize=14, color='#8E44AD')
ax.plot([9.0, 9.0], [2.1, 2.6], color='#8E44AD', lw=2)
ax.plot([8.6, 9.4], [2.4, 2.4], color='#8E44AD', lw=2)
ax.plot([9.0, 8.7], [2.1, 1.6], color='#8E44AD', lw=2)
ax.plot([9.0, 9.3], [2.1, 1.6], color='#8E44AD', lw=2)
ax.text(9.0, 1.3, 'Administrator', fontsize=10, fontweight='bold', ha='center', color='#512E5F')

# Use Cases (Ovals)
use_cases = [
    (5.0, 8.4, 'Register / Login (Google / JWT)', ['cust', 'sales', 'admin']),
    (5.0, 7.4, 'Search & Filter Electronics Catalog', ['cust', 'sales']),
    (5.0, 6.4, 'Calculate Explainable Match Score', ['cust']),
    (5.0, 5.4, 'Compare Products Side-by-Side', ['cust', 'sales']),
    (5.0, 4.4, 'Request Showroom Staff Assistance', ['cust']),
    (5.0, 3.4, 'Manage Assistance Queue & Make Recs', ['sales']),
    (5.0, 2.4, 'Monitor Showroom Floor Inventory', ['sales', 'admin']),
    (5.0, 1.4, 'Manage Users, Staff Approvals & Catalog', ['admin'])
]

for x, y, title, actors in use_cases:
    ellipse = patches.Ellipse((x, y), 4.2, 0.7, facecolor='#E8F8F5', edgecolor='#16A085', linewidth=1.5)
    ax.add_patch(ellipse)
    ax.text(x, y, title, fontsize=8.5, ha='center', va='center', color='#196F3D', fontweight='bold')
    
    if 'cust' in actors:
        ax.plot([1.2, x - 2.1], [5.0, y], color='#7F8C8D', lw=1, linestyle='--')
    if 'sales' in actors:
        ax.plot([8.8, x + 2.1], [6.5, y], color='#7F8C8D', lw=1, linestyle='--')
    if 'admin' in actors:
        ax.plot([8.8, x + 2.1], [2.2, y], color='#7F8C8D', lw=1, linestyle='--')

plt.tight_layout()
plt.savefig(os.path.join(assets_dir, 'use_case_diagram.png'), bbox_inches='tight')
plt.close()
print('Use case diagram saved.')

# 3. Match Score Engine Flowchart
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

# Step 1: User Preferences Input
b1 = patches.FancyBboxPatch((0.5, 3.8), 2.2, 1.6, boxstyle="round,pad=0.1", facecolor='#EBF5FB', edgecolor='#2980B9', lw=2)
ax.add_patch(b1)
ax.text(1.6, 4.6, 'Customer Inputs\n- Category\n- Brand Preference\n- Budget Min/Max\n- Priority Features', fontsize=8.5, ha='center', va='center', fontweight='bold', color='#1B4F72')

# Arrow
ax.annotate('', xy=(3.1, 4.6), xytext=(2.7, 4.6), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=2))

# Step 2: Multi-Criteria Evaluator
b2 = patches.FancyBboxPatch((3.2, 1.0), 3.6, 4.4, boxstyle="round,pad=0.15", facecolor='#FEF9E7', edgecolor='#F39C12', lw=2)
ax.add_patch(b2)
ax.text(5.0, 5.0, 'Multi-Criteria Match Score Engine', fontsize=10, ha='center', va='center', fontweight='bold', color='#7D6608')

eval_weights = [
    ('Budget Compatibility', '30% Weight (INR Price Range Check)'),
    ('Category Match', '25% Weight (Target Device Alignment)'),
    ('Feature Relevance', '20% Weight (Specs Keyword Matching)'),
    ('Brand Preference', '15% Weight (Customer Brand Affinity)'),
    ('Rating & Reliability', '10% Weight (User Review Quality Score)')
]
for i, (title, w) in enumerate(eval_weights):
    sub_bx = patches.FancyBboxPatch((3.4, 4.1 - i*0.72), 3.2, 0.58, boxstyle="round,pad=0.08", facecolor='#FFFFFF', edgecolor='#F1C40F', lw=1)
    ax.add_patch(sub_bx)
    ax.text(5.0, 4.39 - i*0.72, f'{title} [{w}]', fontsize=7.8, ha='center', va='center', color='#2C3E50')

# Arrow
ax.annotate('', xy=(7.3, 4.6), xytext=(6.8, 4.6), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=2))

# Step 3: Explainable Output
b3 = patches.FancyBboxPatch((7.4, 3.8), 2.2, 1.6, boxstyle="round,pad=0.1", facecolor='#EAFaf1', edgecolor='#27AE60', lw=2)
ax.add_patch(b3)
ax.text(8.5, 4.6, 'Explainable Output\n- Match Score (0-100)\n- Criteria Breakdown\n- Decision Rationale\n- Tailored Advice', fontsize=8.5, ha='center', va='center', fontweight='bold', color='#145A32')

plt.tight_layout()
plt.savefig(os.path.join(assets_dir, 'match_score_flow.png'), bbox_inches='tight')
plt.close()
print('Match score flow diagram saved.')

# 4. Activity Diagram (Customer Journey)
fig, ax = plt.subplots(figsize=(9, 6), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 8)
ax.axis('off')

# Start node
start = patches.Circle((5.0, 7.5), 0.25, facecolor='#2C3E50', edgecolor='#2C3E50')
ax.add_patch(start)
ax.text(5.0, 7.15, 'Customer Enters Portal / Showroom', fontsize=8.5, ha='center', fontweight='bold')

# Arrow
ax.annotate('', xy=(5.0, 6.6), xytext=(5.0, 7.25), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.5))

# Action 1
act1 = patches.FancyBboxPatch((3.0, 5.9), 4.0, 0.7, boxstyle="round,pad=0.1", facecolor='#EBF5FB', edgecolor='#2980B9', lw=1.5)
ax.add_patch(act1)
ax.text(5.0, 6.25, 'Input Preferences (Budget, Brand, Category, Features)', fontsize=8.5, ha='center', va='center')

# Arrow
ax.annotate('', xy=(5.0, 5.1), xytext=(5.0, 5.9), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.5))

# Action 2
act2 = patches.FancyBboxPatch((2.8, 4.4), 4.4, 0.7, boxstyle="round,pad=0.1", facecolor='#E8F8F5', edgecolor='#16A085', lw=1.5)
ax.add_patch(act2)
ax.text(5.0, 4.75, 'Engine Computes Product Match Scores & Displays Ranking', fontsize=8.5, ha='center', va='center')

# Arrow
ax.annotate('', xy=(5.0, 3.6), xytext=(5.0, 4.4), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.5))

# Decision Diamond
diamond = patches.Polygon([[5.0, 3.5], [6.5, 2.9], [5.0, 2.3], [3.5, 2.9]], facecolor='#FEF9E7', edgecolor='#F39C12', lw=1.5)
ax.add_patch(diamond)
ax.text(5.0, 2.9, 'Need Floor Assistance\nor EMI Plan?', fontsize=8.0, ha='center', va='center', fontweight='bold')

# Branches
# Yes -> Assistance / EMI
ax.annotate('Yes', xy=(2.2, 1.8), xytext=(3.5, 2.9), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.5))
act_yes = patches.FancyBboxPatch((0.8, 1.1), 2.8, 0.7, boxstyle="round,pad=0.1", facecolor='#FDEDEC', edgecolor='#E74C3C', lw=1.5)
ax.add_patch(act_yes)
ax.text(2.2, 1.45, 'Submit Showroom Request\nor Calculate EMI', fontsize=8.0, ha='center', va='center')

# No -> Proceed to Order
ax.annotate('No', xy=(7.8, 1.8), xytext=(6.5, 2.9), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.5))
act_no = patches.FancyBboxPatch((6.4, 1.1), 2.8, 0.7, boxstyle="round,pad=0.1", facecolor='#EAFaf1', edgecolor='#27AE60', lw=1.5)
ax.add_patch(act_no)
ax.text(7.8, 1.45, 'Add to Wishlist / Place Order', fontsize=8.0, ha='center', va='center')

# Convergence to end
ax.annotate('', xy=(5.0, 0.5), xytext=(2.2, 1.1), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.5))
ax.annotate('', xy=(5.0, 0.5), xytext=(7.8, 1.1), arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.5))

# End Node
end_outer = patches.Circle((5.0, 0.35), 0.25, facecolor='none', edgecolor='#2C3E50', lw=1.5)
end_inner = patches.Circle((5.0, 0.35), 0.15, facecolor='#2C3E50')
ax.add_patch(end_outer)
ax.add_patch(end_inner)

plt.tight_layout()
plt.savefig(os.path.join(assets_dir, 'activity_diagram.png'), bbox_inches='tight')
plt.close()
print('Activity diagram saved.')
