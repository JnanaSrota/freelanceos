from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
import os

template_dir= os.path.join(os.path.dirname(__file__),"templates")
env=Environment(loader=FileSystemLoader(template_dir))

def generate_invoice_pdf(data:dict)->bytes:
    template=env.get_template("invoice.html")
    html_content=template.render(**data)
    pdf=HTML(string=html_content).write_pdf()
    return pdf

    