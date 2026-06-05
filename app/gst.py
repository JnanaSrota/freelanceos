from app import models

YOUR_STATE_CODE="27" #MAHARASHTRA

def compute_gst(subtotal:float,client:models.Client)->dict:

    #Export -zero rated
    if client.is_foreign:
        return {
            "cgst":0,
            "sgst":0,
            "igst":0,
            "gross":subtotal,
            "export":True
        }

    #Intrastate--Same State as u
    if client.state_code==YOUR_STATE_CODE:
        cgst=round(subtotal*0.09,2)
        sgst=round(subtotal*0.09,2)
        return{
            "cgst":cgst,
            "sgst":sgst,
            "igst":0,
            "gross":round(subtotal+cgst+sgst,2),
            "export":False
        }
    
    #Interstate - Different States
    else:
        igst=round(subtotal*0.18,2)
        return{
            "cgst":0,
            "sgst":0,
            "igst":igst,
            "gross":round(subtotal+igst,2),
            "export":False
        }

def compute_tds(subtotal:float,client:models.Client):
    if client.tds_applicable:
        return round(subtotal*0.10,2)
    return 0

def compute_invoice_totals(items:list,client:models.Client)->dict:
    subtotal=round(sum(i["quantity"]*i["rate"] for i in items),2)
    gst=compute_gst(subtotal,client)
    tds=compute_tds(subtotal,client)
    total_payable=round(gst["gross"]-tds,2)

    return {
        "subtotal": subtotal,
        "cgst": gst["cgst"],
        "sgst": gst["sgst"],
        "igst": gst["igst"],
        "gross": gst["gross"],
        "tds_deducted": tds,
        "total_payable": total_payable,
        "export": gst["export"]
    }