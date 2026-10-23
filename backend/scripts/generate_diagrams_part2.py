import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

assets_dir = r'd:\optibuy\report_assets'

# 5. Sequence Diagram
fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

entities = [
    (1.2, 'Customer'),
    (3.2, 'React Client'),
    (5.2, 'Express Server'),
    (7.2, 'PostgreSQL DB'),
    (9.0, 'Sales Exec')
]

for x, name in entities:
    # Lifeline header box
    bx = patches.FancyBboxPatch((x - 0.7, 9.2), 1.4, 0.6, boxstyle="round,pad=0.05", facecolor='#EBF5FB', edgecolor='#2980B9', lw=1.5)
    ax.add_patch(bx)
    ax.text(x, 9.5, name, fontsize=8.5, ha='center', va='center', fontweight='bold', color='#1B4F72')
    # Lifeline dashed line
    ax.plot([x, x], [1.0, 9.2], color='#7F8C8D', linestyle='--', lw=1)

# Sequence steps
steps = [
    (1.2, 3.2, 8.5, '1. Select preferences & click evaluate', '->'),
    (3.2, 5.2, 7.8, '2. POST /api/customer/match-score/calculate', '->'),
    (5.2, 7.2, 7.1, '3. Query products & specs from DB', '->'),
    (7.2, 5.2, 6.4, '4. Return products & specifications', '-->'),
    (5.2, 3.2, 5.7, '5. Compute scores & return JSON breakdown', '-->'),
    (3.2, 1.2, 5.0, '6. Render explainable match scores', '-->'),
    (1.2, 3.2, 4.3, '7. Submit floor assistance inquiry', '->'),
    (3.2, 5.2, 3.6, '8. POST /api/customer/assistance', '->'),
    (5.2, 7.2, 2.9, '9. Insert into customer_assistance_requests', '->'),
    (5.2, 9.0, 2.2, '10. Notify sales queue (Assistance Alert)', '->'),
    (9.0, 5.2, 1.5, '11. Accept request & post recommendation', '->')
]

for x1, x2, y, label, style in steps:
    is_dashed = '--' in style
    ax.annotate('', xy=(x2, y), xytext=(x1, y),
                arrowprops=dict(arrowstyle="->", color='#2C3E50', lw=1.4, linestyle='--' if is_dashed else '-'))
    mid_x = (x1 + x2) / 2
    ax.text(mid_x, y + 0.15, label, fontsize=7.2, ha='center', va='bottom', color='#2C3E50', backgroundcolor='#FFFFFF')

plt.tight_layout()
plt.savefig(os.path.join(assets_dir, 'sequence_diagram.png'), bbox_inches='tight')
plt.close()
print('Sequence diagram saved.')

# 6. Database ER Diagram
fig, ax = plt.subplots(figsize=(10, 7), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

tables = [
    (1.8, 8.0, 'tbl_users', ['user_id (PK)', 'full_name', 'email', 'phone', 'password_hash', 'role', 'status']),
    (5.0, 8.0, 'sales_person_profiles', ['user_id (FK)', 'employee_id', 'department', 'showroom_section', 'monthly_target']),
    (8.2, 8.0, 'customer_assistance', ['id (PK)', 'customer_id (FK)', 'sales_person_id (FK)', 'product_id (FK)', 'status']),
    (1.8, 4.0, 'tbl_categories', ['category_id (PK)', 'name', 'description', 'status']),
    (5.0, 4.0, 'tbl_products', ['product_id (PK)', 'category_id (FK)', 'brand_id (FK)', 'name', 'price', 'decision_score', 'stock']),
    (8.2, 4.0, 'product_recommendations', ['id (PK)', 'sales_person_id (FK)', 'customer_id (FK)', 'product_id (FK)', 'notes']),
    (1.8, 1.2, 'user_preferences', ['id (PK)', 'user_id (FK)', 'preferred_category', 'min_budget', 'max_budget', 'features']),
    (5.0, 1.2, 'tbl_orders', ['order_id (PK)', 'customer_id (FK)', 'salesperson_id (FK)', 'total_amount', 'order_status']),
    (8.2, 1.2, 'tbl_order_items', ['item_id (PK)', 'order_id (FK)', 'product_id (FK)', 'quantity', 'unit_price'])
]

for x, y, name, fields in tables:
    h = 0.35 + len(fields) * 0.22
    bx = patches.FancyBboxPatch((x - 1.2, y - h/2), 2.4, h, boxstyle="round,pad=0.08", facecolor='#FDFEFE', edgecolor='#2471A3', lw=1.5)
    ax.add_patch(bx)
    # Header strip
    hdr = patches.Rectangle((x - 1.2, y + h/2 - 0.35), 2.4, 0.35, facecolor='#2980B9', edgecolor='#2471A3')
    ax.add_patch(hdr)
    ax.text(x, y + h/2 - 0.18, name, fontsize=8.0, ha='center', va='center', fontweight='bold', color='#FFFFFF')
    # Fields
    for idx, f in enumerate(fields):
        ax.text(x - 1.1, y + h/2 - 0.52 - idx*0.22, f, fontsize=6.8, ha='left', va='center', color='#2C3E50')

# Connections
lines = [
    ((1.8, 6.7), (1.8, 2.3)), # tbl_users -> user_preferences
    ((3.0, 8.0), (3.8, 8.0)), # tbl_users -> sales_person_profiles
    ((6.2, 8.0), (7.0, 8.0)), # sales_profiles -> customer_assistance
    ((3.0, 4.0), (3.8, 4.0)), # categories -> products
    ((6.2, 4.0), (7.0, 4.0)), # products -> recommendations
    ((5.0, 2.7), (5.0, 2.3)), # products -> orders
    ((6.2, 1.2), (7.0, 1.2))  # orders -> order_items
]

for p1, p2 in lines:
    ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#7F8C8D', lw=1.2, linestyle=':')

plt.tight_layout()
plt.savefig(os.path.join(assets_dir, 'database_er_diagram.png'), bbox_inches='tight')
plt.close()
print('ER diagram saved.')
