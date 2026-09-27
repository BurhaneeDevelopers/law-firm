// Demo data for a realistic Indian practice (Rohtak, Haryana).
// Hearing, deadline and activity dates are relative to today so the diary is never empty.
import { addDays, format, subDays, subHours } from "date-fns"

const base = new Date()
// Courts do not sit on Sundays: future dates roll to Monday, past dates back to Saturday.
// Today stays as is so the demo board is never empty.
const day = (offset: number) => {
  let d = addDays(base, offset)
  if (offset !== 0 && d.getDay() === 0) d = addDays(d, offset > 0 ? 1 : -1)
  return format(d, "yyyy-MM-dd")
}
const ago = (hours: number) => subHours(base, hours).toISOString()
const daysAgo = (days: number) => subDays(base, days).toISOString()

export const demoLawyer = {
  id: "lawyer-1",
  name: "Your Name",
  title: "Senior Advocate",
  email: "you@yourchambers.in",
  phone: "+91 90000 00000",
  bar_council_no: "XX/0000/2015",
  enrollment_no: "HR/123/2014",
  firm_name: "Your Chambers",
  firm_address: "Chamber No. 00, District Courts, Your City 000000",
  firm_gstin: "",
  upi_id: "yourname@upi",
  specializations: ["Criminal Law", "Property Disputes", "Family Law"],
  courts: ["Rohtak District Court", "Punjab & Haryana High Court"],
  languages: ["Hindi", "English", "Haryanvi"],
  avatar: null as string | null,
}

export const demoClients = [
  { id: "c1", lawyer_id: "lawyer-1", full_name: "Ramesh Kumar Sharma", phone: "+91 98112 34567", email: "ramesh.sharma@gmail.com", address: "Village Asthal Bohar, Rohtak, Haryana", city: "Rohtak", id_proof_type: "Aadhaar", id_proof_number: "4521 8963 1254", referred_by: "Direct", preferred_language: "Hindi", notes: "Long-standing client. Prefers calls after 6 PM.", created_at: "2024-01-15T09:00:00Z" },
  { id: "c2", lawyer_id: "lawyer-1", full_name: "Sunita Devi Yadav", phone: "+91 97343 56789", email: "sunita.yadav@yahoo.co.in", address: "H.No. 45, Shastri Nagar, Rohtak", city: "Rohtak", id_proof_type: "Voter ID", id_proof_number: "WQR/34/2008/023456", referred_by: "Ramesh Kumar", preferred_language: "Hindi", notes: "Divorce matter. Sensitive, speak only to client directly.", created_at: "2024-02-03T10:30:00Z" },
  { id: "c3", lawyer_id: "lawyer-1", full_name: "Vijay Singh Hooda", phone: "+91 94563 12345", email: "vijayhooda@outlook.com", address: "Plot No. 12, Sector 4, Bahadurgarh", city: "Bahadurgarh", id_proof_type: "PAN Card", id_proof_number: "BXPVH4321K", referred_by: "Bar Association", preferred_language: "English", notes: "Property developer with multiple disputes.", created_at: "2024-02-18T11:00:00Z" },
  { id: "c4", lawyer_id: "lawyer-1", full_name: "Meena Rani Bansal", phone: "+91 93456 78901", email: "", address: "Near Old Bus Stand, Jhajjar, Haryana", city: "Jhajjar", id_proof_type: "Aadhaar", id_proof_number: "8734 5612 9023", referred_by: "Sunita Devi", preferred_language: "Hindi", notes: "", created_at: "2024-03-05T09:45:00Z" },
  { id: "c5", lawyer_id: "lawyer-1", full_name: "Harinder Pal Singh", phone: "+91 99876 54321", email: "harinder.pal@gmail.com", address: "House 78, Civil Lines, Rohtak", city: "Rohtak", id_proof_type: "Passport", id_proof_number: "P4521938", referred_by: "Direct", preferred_language: "English", notes: "NRI client. Reachable on WhatsApp only.", created_at: "2024-03-20T14:00:00Z" },
  { id: "c6", lawyer_id: "lawyer-1", full_name: "Santosh Kumari", phone: "+91 96321 09876", email: "santosh.k@rediffmail.com", address: "Village Mokhra, Rohtak", city: "Rohtak", id_proof_type: "Aadhaar", id_proof_number: "6523 1254 8763", referred_by: "Vijay Singh", preferred_language: "Hindi", notes: "", created_at: "2024-04-01T10:00:00Z" },
  { id: "c7", lawyer_id: "lawyer-1", full_name: "Rajesh Dhankar", phone: "+91 91234 56789", email: "rajesh.dhankar@gmail.com", address: "Dhankar Bhavan, Sonipat Road, Rohtak", city: "Rohtak", id_proof_type: "Driving Licence", id_proof_number: "HR-04-2019-0123456", referred_by: "Bar Association", preferred_language: "English", notes: "Businessman. Pays on time.", created_at: "2024-04-10T11:30:00Z" },
  { id: "c8", lawyer_id: "lawyer-1", full_name: "Preeti Garg", phone: "+91 98543 21098", email: "preeti.garg@gmail.com", address: "Flat 3B, Green Park Colony, Rohtak", city: "Rohtak", id_proof_type: "Aadhaar", id_proof_number: "2345 6789 0123", referred_by: "Harinder Pal", preferred_language: "English", notes: "Domestic violence matter. Keep address confidential.", created_at: "2024-04-22T09:00:00Z" },
  { id: "c9", lawyer_id: "lawyer-1", full_name: "Mohan Lal Verma", phone: "+91 92345 67890", email: "", address: "Village Kheri Khurd, Jhajjar", city: "Jhajjar", id_proof_type: "Voter ID", id_proof_number: "ABC/12/3456", referred_by: "Direct", preferred_language: "Hindi", notes: "", created_at: "2024-05-05T10:00:00Z" },
  { id: "c10", lawyer_id: "lawyer-1", full_name: "Kavita Sheoran", phone: "+91 87654 32109", email: "kavita.sheoran@gmail.com", address: "H.No. 234, Sector 2, Rohtak", city: "Rohtak", id_proof_type: "Aadhaar", id_proof_number: "9876 5432 1098", referred_by: "Rajesh Dhankar", preferred_language: "Hindi", notes: "", created_at: "2024-05-15T11:00:00Z" },
  { id: "c11", lawyer_id: "lawyer-1", full_name: "Dharam Singh Nain", phone: "+91 99123 45678", email: "dharamsingh@gmail.com", address: "Nain Haveli, Bahadurgarh", city: "Bahadurgarh", id_proof_type: "PAN Card", id_proof_number: "AYKPN1234F", referred_by: "Direct", preferred_language: "Hindi", notes: "In custody. Family contact: son, +91 99123 45600.", created_at: "2024-05-28T09:00:00Z" },
  { id: "c12", lawyer_id: "lawyer-1", full_name: "Anita Malik", phone: "+91 96789 01234", email: "anita.malik@gmail.com", address: "Sector 14, Sonipat", city: "Sonipat", id_proof_type: "Aadhaar", id_proof_number: "3456 7890 1234", referred_by: "Meena Rani", preferred_language: "English", notes: "", created_at: daysAgo(2) },
]

export const demoCases = [
  { id: "case-1", lawyer_id: "lawyer-1", client_id: "c1", case_number: "CRL/204/2024", cnr_number: "HRRT010012342024", title: "State vs. Ramesh Kumar Sharma (IPC 420, cheating)", case_type: "Criminal", court: "Rohtak District Court", judge: "Sh. R.K. Malik, ASJ", filing_date: "2024-01-20", status: "Active", priority: "Urgent", opposing_party: "State of Haryana", description: "Accused of cheating a property dealer of ₹12 lakh through forged documents. Bail granted on 15 Feb 2024.", fee_agreed: 150000, created_at: "2024-01-20T09:00:00Z" },
  { id: "case-2", lawyer_id: "lawyer-1", client_id: "c2", case_number: "HMA/89/2024", cnr_number: "HRRT020004562024", title: "Sunita Devi Yadav vs. Suresh Yadav (divorce petition)", case_type: "Divorce", court: "Family Court, Rohtak", judge: "Smt. Priya Sharma, Principal Judge", filing_date: "2024-02-05", status: "Active", priority: "Normal", opposing_party: "Suresh Yadav", description: "Mutual consent petition under Section 13B HMA. Property partition and child custody pending.", fee_agreed: 80000, created_at: "2024-02-05T10:00:00Z" },
  { id: "case-3", lawyer_id: "lawyer-1", client_id: "c3", case_number: "CWP/3120/2024", cnr_number: "PHHC010312342024", title: "Vijay Singh Hooda vs. HSVP (land acquisition)", case_type: "Property", court: "Punjab & Haryana High Court", judge: "Hon'ble Mr. Justice A.K. Singh", filing_date: "2024-02-20", status: "Hearing Scheduled", priority: "Urgent", opposing_party: "Haryana Shehri Vikas Pradhikaran", description: "3 acres of agricultural land acquired without proper compensation. Interim stay granted subject to deposit.", fee_agreed: 350000, created_at: "2024-02-20T11:00:00Z" },
  { id: "case-4", lawyer_id: "lawyer-1", client_id: "c4", case_number: "DV/456/2024", cnr_number: "HRJH030004562024", title: "Meena Rani Bansal vs. Deepak Bansal (DV Act)", case_type: "Criminal", court: "Magistrate Court, Jhajjar", judge: "Sh. S.K. Rao, JMIC", filing_date: "2024-03-07", status: "Active", priority: "Urgent", opposing_party: "Deepak Bansal", description: "Protection order under the DV Act. Maintenance of ₹15,000 per month sought. Ex-parte order in force.", fee_agreed: 60000, created_at: "2024-03-07T09:00:00Z" },
  { id: "case-5", lawyer_id: "lawyer-1", client_id: "c5", case_number: "CS/178/2023", cnr_number: "HRRT010017822023", title: "Harinder Pal Singh vs. Ram Prakash (recovery of possession)", case_type: "Civil", court: "Rohtak District Court", judge: "Sh. N.K. Verma, Civil Judge (SD)", filing_date: "2023-09-10", status: "Judgment Awaited", priority: "Normal", opposing_party: "Ram Prakash & Sons", description: "Recovery of possession of shop No. 12, Main Market Rohtak. Final arguments concluded.", fee_agreed: 120000, created_at: "2023-09-10T14:00:00Z" },
  { id: "case-6", lawyer_id: "lawyer-1", client_id: "c6", case_number: "CRL/89/2024", cnr_number: "HRRT010008912024", title: "State vs. Santosh Kumari (encroachment)", case_type: "Criminal", court: "Rohtak District Court", judge: "Sh. R.K. Malik, ASJ", filing_date: "2024-04-02", status: "Active", priority: "Normal", opposing_party: "State of Haryana", description: "Alleged encroachment on panchayat land near the village pond. Bail application filed.", fee_agreed: 40000, created_at: "2024-04-02T10:00:00Z" },
  { id: "case-7", lawyer_id: "lawyer-1", client_id: "c7", case_number: "CS/234/2024", cnr_number: "HRRT010023452024", title: "Rajesh Dhankar vs. Mahesh Trading Co. (money recovery)", case_type: "Civil", court: "Rohtak District Court", judge: "Sh. V.K. Gupta, Civil Judge (SD)", filing_date: "2024-04-12", status: "Active", priority: "Normal", opposing_party: "Mahesh Trading Company Pvt. Ltd.", description: "Recovery of ₹45 lakh against dishonoured cheques. Section 138 NI Act complaint filed in parallel.", fee_agreed: 225000, created_at: "2024-04-12T11:00:00Z" },
  { id: "case-8", lawyer_id: "lawyer-1", client_id: "c8", case_number: "GW/123/2024", cnr_number: "HRRT020012312024", title: "Preeti Garg vs. Anil Garg (custody and maintenance)", case_type: "Divorce", court: "Family Court, Rohtak", judge: "Smt. Priya Sharma, Principal Judge", filing_date: "2024-04-24", status: "Active", priority: "Urgent", opposing_party: "Anil Garg", description: "Custody of 2 minor children and maintenance of ₹25,000 per month. Interim custody granted.", fee_agreed: 90000, created_at: "2024-04-24T09:00:00Z" },
  { id: "case-9", lawyer_id: "lawyer-1", client_id: "c9", case_number: "CS/567/2023", cnr_number: "HRRT010056712023", title: "Mohan Lal Verma vs. Gram Panchayat (shamlat land)", case_type: "Property", court: "Rohtak District Court", judge: "Sh. S.R. Mehta, Civil Judge", filing_date: "2023-11-15", status: "Closed", priority: "Normal", opposing_party: "Gram Panchayat, Kheri Khurd", description: "Shamlat land dispute. Decree passed in favour of the client on 10 Mar 2024.", fee_agreed: 50000, created_at: "2023-11-15T10:00:00Z" },
  { id: "case-10", lawyer_id: "lawyer-1", client_id: "c10", case_number: "SC/345/2024", cnr_number: "HRRT040034512024", title: "State vs. Kavita Sheoran (IPC 307)", case_type: "Criminal", court: "Sessions Court, Rohtak", judge: "Sh. A.B. Kumar, Sessions Judge", filing_date: "2024-05-17", status: "Hearing Scheduled", priority: "Urgent", opposing_party: "State of Haryana", description: "Charges yet to be framed. Regular bail application pending before the Sessions Court.", fee_agreed: 175000, created_at: "2024-05-17T11:00:00Z" },
  { id: "case-11", lawyer_id: "lawyer-1", client_id: "c11", case_number: "CRM-M/4120/2024", cnr_number: "PHHC020041202024", title: "Dharam Singh Nain vs. NCB (NDPS bail)", case_type: "Criminal", court: "Punjab & Haryana High Court", judge: "Hon'ble Mr. Justice R.K. Sharma", filing_date: "2024-05-30", status: "Active", priority: "Urgent", opposing_party: "Narcotics Control Bureau", description: "Arrested under the NDPS Act. Regular bail petition under Section 483 BNSS pending before the High Court.", fee_agreed: 300000, created_at: "2024-05-30T09:00:00Z" },
  { id: "case-12", lawyer_id: "lawyer-1", client_id: "c12", case_number: "CC/678/2024", cnr_number: "HRSN050067812024", title: "Anita Malik vs. Rohini Sectors (consumer complaint)", case_type: "Civil", court: "District Consumer Forum, Sonipat", judge: "Sh. D.K. Jain, President", filing_date: "2024-06-03", status: "Active", priority: "Normal", opposing_party: "Rohini Sectors Pvt. Ltd.", description: "Defective flat allotment. Compensation of ₹8 lakh with interest sought.", fee_agreed: 45000, created_at: daysAgo(2) },
  { id: "case-13", lawyer_id: "lawyer-1", client_id: "c1", case_number: "CS/890/2022", cnr_number: "HRRT010089022022", title: "Ramesh Kumar Sharma vs. Ramphal Sharma (partition)", case_type: "Property", court: "Rohtak District Court", judge: "Sh. N.K. Verma, Civil Judge (SD)", filing_date: "2022-08-12", status: "Won", priority: "Normal", opposing_party: "Ramphal Sharma (brother)", description: "Partition of 14 acres ancestral land. Decree in favour of the client. Execution pending.", fee_agreed: 200000, created_at: "2022-08-12T10:00:00Z" },
  { id: "case-14", lawyer_id: "lawyer-1", client_id: "c3", case_number: "CRM-M/560/2023", cnr_number: "PHHC020005602023", title: "Vijay Singh Hooda (anticipatory bail)", case_type: "Criminal", court: "Punjab & Haryana High Court", judge: "Hon'ble Mr. Justice P.S. Mann", filing_date: "2023-05-20", status: "Closed", priority: "Normal", opposing_party: "State of Haryana", description: "Anticipatory bail in FIR 234/2023, PS City Rohtak. Granted on 30 May 2023 with conditions.", fee_agreed: 100000, created_at: "2023-05-20T11:00:00Z" },
  { id: "case-15", lawyer_id: "lawyer-1", client_id: "c7", case_number: "NACT/123/2024", cnr_number: "HRRT030012312024", title: "Rajesh Dhankar vs. Kapoor Industries (cheque dishonour)", case_type: "Criminal", court: "Magistrate Court, Rohtak", judge: "Sh. R.S. Rana, JMIC", filing_date: "2024-04-15", status: "Active", priority: "Normal", opposing_party: "Kapoor Industries Ltd.", description: "Section 138 NI Act. Cheque of ₹12 lakh dishonoured twice. Notice served.", fee_agreed: 70000, created_at: "2024-04-15T11:00:00Z" },
  { id: "case-16", lawyer_id: "lawyer-1", client_id: "c5", case_number: "SUCC/901/2024", cnr_number: "HRRT010090112024", title: "Harinder Pal Singh (succession certificate)", case_type: "Civil", court: "Rohtak District Court", judge: "Sh. B.K. Sharma, Civil Judge", filing_date: "2024-03-25", status: "Active", priority: "Normal", opposing_party: "N/A", description: "Succession certificate for bank FDs and savings after father's demise. Objection period running.", fee_agreed: 35000, created_at: "2024-03-25T14:00:00Z" },
  { id: "case-17", lawyer_id: "lawyer-1", client_id: "c2", case_number: "CS/234/2023", cnr_number: "HRRT010023412023", title: "Sunita Devi Yadav vs. Suresh Yadav family (stridhan recovery)", case_type: "Civil", court: "Rohtak District Court", judge: "Sh. V.K. Gupta, Civil Judge (SD)", filing_date: "2023-12-10", status: "Hearing Scheduled", priority: "Normal", opposing_party: "Suresh Yadav and family", description: "Recovery of jewellery and household articles worth ₹8 lakh. List of articles filed.", fee_agreed: 60000, created_at: "2023-12-10T10:00:00Z" },
  { id: "case-18", lawyer_id: "lawyer-1", client_id: "c4", case_number: "MAINT/456/2024", cnr_number: "HRJH030045612024", title: "Meena Rani Bansal vs. Deepak Bansal (maintenance)", case_type: "Civil", court: "Magistrate Court, Jhajjar", judge: "Sh. S.K. Rao, JMIC", filing_date: "2024-03-10", status: "Active", priority: "Normal", opposing_party: "Deepak Bansal", description: "Section 144 BNSS (old Section 125 CrPC). Maintenance of ₹20,000 per month for wife and son.", fee_agreed: 40000, created_at: "2024-03-10T09:00:00Z" },
  { id: "case-19", lawyer_id: "lawyer-1", client_id: "c6", case_number: "CS/789/2023", cnr_number: "HRRT010078912023", title: "Santosh Kumari vs. her brothers (partition of agricultural land)", case_type: "Property", court: "Rohtak District Court", judge: "Sh. S.R. Mehta, Civil Judge", filing_date: "2023-07-14", status: "Judgment Awaited", priority: "Normal", opposing_party: "Brothers of Santosh Kumari", description: "Partition of 8 acres ancestral land. Arguments concluded.", fee_agreed: 80000, created_at: "2023-07-14T10:00:00Z" },
  { id: "case-20", lawyer_id: "lawyer-1", client_id: "c8", case_number: "CRL/567/2024", cnr_number: "HRRT030056712024", title: "State vs. Anil Garg (IPC 498A, cruelty)", case_type: "Criminal", court: "Magistrate Court, Rohtak", judge: "Sh. R.S. Rana, JMIC", filing_date: "2024-04-28", status: "Active", priority: "Urgent", opposing_party: "State of Haryana", description: "FIR lodged by Preeti Garg. Accused on bail with conditions. Trial stage. Appearing for complainant.", fee_agreed: 50000, created_at: "2024-04-28T09:00:00Z" },
]

export const demoHearings = [
  { id: "h1", case_id: "case-1", date: day(0), time: "10:30", court_room: "Court No. 5, District Courts Rohtak", item_no: "14", purpose: "Argument", outcome: "", outcome_notes: "", reminder_sent: true },
  { id: "h2", case_id: "case-10", date: day(0), time: "11:00", court_room: "Sessions Court, Hall 2", item_no: "7", purpose: "Framing of Charges", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h3", case_id: "case-3", date: day(0), time: "14:30", court_room: "P&H High Court, Court 12", item_no: "38", purpose: "Mention", outcome: "", outcome_notes: "", reminder_sent: true },
  { id: "h4", case_id: "case-11", date: day(1), time: "10:00", court_room: "P&H High Court, Court 8", item_no: "22", purpose: "Bail", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h5", case_id: "case-2", date: day(1), time: "11:30", court_room: "Family Court, Room 2", item_no: "3", purpose: "Mediation", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h6", case_id: "case-7", date: day(2), time: "10:00", court_room: "Court No. 3, District Courts Rohtak", item_no: "11", purpose: "Evidence", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h7", case_id: "case-8", date: day(6), time: "11:00", court_room: "Family Court, Room 1", item_no: "5", purpose: "Argument", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h8", case_id: "case-17", date: day(6), time: "14:00", court_room: "Court No. 7, District Courts Rohtak", item_no: "19", purpose: "Evidence", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h9", case_id: "case-15", date: day(9), time: "10:00", court_room: "JMIC Court 2, Rohtak", item_no: "31", purpose: "Cross-examination", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h10", case_id: "case-20", date: day(13), time: "10:30", court_room: "JMIC Court 2, Rohtak", item_no: "9", purpose: "Evidence", outcome: "", outcome_notes: "", reminder_sent: false },
  { id: "h11", case_id: "case-1", date: day(-7), time: "10:30", court_room: "Court No. 5, District Courts Rohtak", item_no: "12", purpose: "Bail", outcome: "Order passed", outcome_notes: "Bail conditions relaxed. Listed for arguments.", reminder_sent: true },
  { id: "h12", case_id: "case-4", date: day(-1), time: "11:00", court_room: "Magistrate Court, Jhajjar", item_no: "4", purpose: "Ex-parte Order", outcome: "Order passed", outcome_notes: "Protection order extended for 3 months.", reminder_sent: true },
  { id: "h13", case_id: "case-6", date: day(-2), time: "10:00", court_room: "Court No. 5, District Courts Rohtak", item_no: "18", purpose: "Argument", outcome: "", outcome_notes: "", reminder_sent: true },
]

export const demoDocuments = [
  { id: "doc-1", case_id: "case-1", filename: "Bail_Application_Sharma.pdf", file_url: "", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Your Name", created_at: "2024-01-22T10:00:00Z", size: "245 KB" },
  { id: "doc-2", case_id: "case-1", filename: "FIR_Copy_204_2024.pdf", file_url: "", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Your Name", created_at: "2024-01-21T09:00:00Z", size: "123 KB" },
  { id: "doc-3", case_id: "case-2", filename: "Divorce_Petition_HMA89.pdf", file_url: "", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Your Name", created_at: "2024-02-06T10:30:00Z", size: "312 KB" },
  { id: "doc-4", case_id: "case-3", filename: "Jamabandi_Land_Records_Hooda.pdf", file_url: "", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Your Name", created_at: "2024-02-22T11:00:00Z", size: "1.2 MB" },
  { id: "doc-5", case_id: "case-3", filename: "Interim_Stay_Order_HC.pdf", file_url: "", file_type: "PDF", doc_category: "Order", uploaded_by: "Adv. Your Name", created_at: "2024-03-01T09:00:00Z", size: "89 KB" },
  { id: "doc-6", case_id: "case-4", filename: "DV_Protection_Order.pdf", file_url: "", file_type: "PDF", doc_category: "Order", uploaded_by: "Adv. Your Name", created_at: "2024-03-10T10:00:00Z", size: "156 KB" },
  { id: "doc-7", case_id: "case-5", filename: "Sale_Deed_Shop12.pdf", file_url: "", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Your Name", created_at: "2023-09-15T11:00:00Z", size: "2.1 MB" },
  { id: "doc-8", case_id: "case-7", filename: "Demand_Notice_Mahesh_Trading.docx", file_url: "", file_type: "Word", doc_category: "Notice", uploaded_by: "Adv. Your Name", created_at: "2024-04-14T09:00:00Z", size: "45 KB" },
  { id: "doc-9", case_id: "case-8", filename: "Interim_Custody_Order.pdf", file_url: "", file_type: "PDF", doc_category: "Order", uploaded_by: "Adv. Your Name", created_at: "2024-04-30T10:00:00Z", size: "178 KB" },
  { id: "doc-10", case_id: "case-10", filename: "Bail_Application_Sheoran.pdf", file_url: "", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Your Name", created_at: "2024-05-18T11:00:00Z", size: "234 KB" },
  { id: "doc-11", case_id: "case-11", filename: "HC_Bail_Petition_NDPS.pdf", file_url: "", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Your Name", created_at: daysAgo(4), size: "289 KB" },
  { id: "doc-12", case_id: "case-12", filename: "Consumer_Complaint_Malik.pdf", file_url: "", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Your Name", created_at: daysAgo(2), size: "167 KB" },
  { id: "doc-13", case_id: "case-15", filename: "Section138_Notice_Kapoor.pdf", file_url: "", file_type: "PDF", doc_category: "Notice", uploaded_by: "Adv. Your Name", created_at: "2024-04-17T09:00:00Z", size: "78 KB" },
  { id: "doc-14", case_id: "case-20", filename: "FIR_498A_Garg.pdf", file_url: "", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Your Name", created_at: "2024-04-29T10:00:00Z", size: "134 KB" },
  { id: "doc-15", case_id: "case-2", filename: "Marriage_Certificate_Yadav.pdf", file_url: "", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Your Name", created_at: ago(5), size: "245 KB" },
  { id: "doc-16", case_id: "case-3", filename: "Vakalatnama_Hooda.pdf", file_url: "", file_type: "PDF", doc_category: "Vakalatnama", uploaded_by: "Adv. Your Name", created_at: "2024-02-21T11:00:00Z", size: "64 KB" },
]

export const demoNotices = [
  { id: "n1", case_id: "case-7", lawyer_id: "lawyer-1", title: "Demand notice to Mahesh Trading Co.", notice_type: "Demand Notice", recipient_name: "Mahesh Trading Company Pvt. Ltd.", content: "Under instructions from and on behalf of my client, Shri Rajesh Dhankar, I hereby serve upon you the following legal notice:\n\n1. That my client supplied goods to you against invoices totalling ₹45,00,000 between April 2023 and January 2024.\n\n2. That the cheques issued by you towards the said dues were returned unpaid with the remark \"Funds Insufficient\".\n\n3. That you are hereby called upon to pay the said sum of ₹45,00,000 along with interest at 18% per annum within 15 days of receipt of this notice, failing which my client shall initiate civil and criminal proceedings against you at your risk as to costs and consequences.\n\nA copy of this notice is retained in my office for further action.", status: "Sent", created_at: "2024-04-16T10:00:00Z" },
  { id: "n2", case_id: "case-15", lawyer_id: "lawyer-1", title: "Section 138 notice to Kapoor Industries", notice_type: "Demand Notice", recipient_name: "Kapoor Industries Ltd.", content: "LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881\n\n1. That you issued cheque No. 004512 dated 02.03.2024 for ₹12,00,000 drawn on State Bank of India, Rohtak, in favour of my client.\n\n2. That the said cheque was dishonoured on presentation with the remark \"Funds Insufficient\" vide return memo dated 20.03.2024.\n\n3. That you are called upon to make payment of the cheque amount within 15 days of receipt of this notice, failing which my client shall file a complaint under Section 138 of the Act.", status: "Sent", created_at: "2024-04-18T09:00:00Z" },
  { id: "n3", case_id: "case-3", lawyer_id: "lawyer-1", title: "Vakalatnama, Hooda vs. HSVP", notice_type: "Vakalatnama", recipient_name: "Punjab & Haryana High Court", content: "I, Vijay Singh Hooda, son of Late Sh. Randhir Singh Hooda, resident of Plot No. 12, Sector 4, Bahadurgarh, do hereby appoint and retain Advocate Your Name to appear, act and plead for me in the above matter and to conduct all proceedings on my behalf.", status: "Sent", created_at: "2024-02-21T11:00:00Z" },
  { id: "n4", case_id: "case-12", lawyer_id: "lawyer-1", title: "Consumer notice to Rohini Sectors", notice_type: "Demand Notice", recipient_name: "M/s Rohini Sectors Pvt. Ltd.", content: "Under instructions from my client, Smt. Anita Malik, allottee of Flat No. 804, Tower C, Rohini Heights, Sonipat:\n\n1. That possession was offered in a defective condition with seepage, cracked flooring and non-functional lifts.\n\n2. That you are called upon to rectify the defects or compensate my client with ₹8,00,000 along with interest within 30 days.", status: "Draft", created_at: daysAgo(1) },
  { id: "n5", case_id: "case-20", lawyer_id: "lawyer-1", title: "Reply to bail application, Anil Garg", notice_type: "Legal Reply", recipient_name: "Court of JMIC, Rohtak", content: "IN THE COURT OF THE JUDICIAL MAGISTRATE FIRST CLASS, ROHTAK\n\nReply on behalf of the complainant to the application for cancellation of bail conditions.\n\n1. That the accused has repeatedly violated the condition of not contacting the complainant.\n\n2. That the relaxation sought is liable to be dismissed.", status: "Sent", created_at: "2024-04-30T09:00:00Z" },
]

export const demoNotes = [
  { id: "note-1", case_id: "case-1", content: "Client called. Worried about the next date. Explained bail conditions and asked him to be present by 10 AM.", is_pinned: true, created_by: "Adv. Your Name", created_at: daysAgo(12) },
  { id: "note-2", case_id: "case-1", content: "Prosecution filed list of witnesses. Challenge PW-3, who is related to the complainant.", is_pinned: false, created_by: "Adv. Your Name", created_at: daysAgo(9) },
  { id: "note-3", case_id: "case-2", content: "Both parties agreed in mediation to a 40/60 split of property. Draft settlement deed next week.", is_pinned: true, created_by: "Adv. Your Name", created_at: daysAgo(6) },
  { id: "note-4", case_id: "case-3", content: "HC granted stay subject to ₹50,000 deposit. Client deposited it. Keep the receipt on file.", is_pinned: true, created_by: "Adv. Your Name", created_at: daysAgo(40) },
  { id: "note-5", case_id: "case-11", content: "Bail listed tomorrow. Prepare written submissions on Section 37 NDPS twin conditions and custody period.", is_pinned: false, created_by: "Adv. Your Name", created_at: daysAgo(3) },
]

export const demoPayments = [
  { id: "p1", case_id: "case-1", due_id: "", amount: 50000, mode: "UPI", reference: "UPI 412356789012", note: "First instalment", date: "2024-01-20" },
  { id: "p2", case_id: "case-1", due_id: "", amount: 40000, mode: "Cash", reference: "", note: "At bail hearing", date: "2024-02-16" },
  { id: "p3", case_id: "case-2", due_id: "", amount: 50000, mode: "Bank transfer", reference: "NEFT N0482231", note: "", date: "2024-02-05" },
  { id: "p4", case_id: "case-3", due_id: "", amount: 200000, mode: "Cheque", reference: "Chq 118245", note: "Retainer", date: "2024-02-20" },
  { id: "p5", case_id: "case-4", due_id: "", amount: 20000, mode: "Cash", reference: "", note: "", date: "2024-03-07" },
  { id: "p6", case_id: "case-5", due_id: "due-15", amount: 120000, mode: "Bank transfer", reference: "IMPS 99812", note: "Full fee", date: "2023-09-12" },
  { id: "p7", case_id: "case-7", due_id: "", amount: 100000, mode: "UPI", reference: "UPI 998811223344", note: "", date: "2024-04-12" },
  { id: "p8", case_id: "case-8", due_id: "", amount: 30000, mode: "UPI", reference: "UPI 761234980011", note: "", date: "2024-04-24" },
  { id: "p9", case_id: "case-10", due_id: "", amount: 75000, mode: "Cash", reference: "", note: "", date: "2024-05-17" },
  { id: "p10", case_id: "case-11", due_id: "", amount: 150000, mode: "Bank transfer", reference: "NEFT N0918273", note: "Paid by son", date: "2024-05-30" },
  { id: "p11", case_id: "case-13", due_id: "", amount: 200000, mode: "Cheque", reference: "Chq 004411", note: "Full fee", date: "2023-03-02" },
  { id: "p12", case_id: "case-14", due_id: "", amount: 100000, mode: "Bank transfer", reference: "", note: "Full fee", date: "2023-05-20" },
  { id: "p13", case_id: "case-15", due_id: "", amount: 35000, mode: "UPI", reference: "", note: "", date: "2024-04-15" },
  { id: "p14", case_id: "case-9", due_id: "", amount: 50000, mode: "Cash", reference: "", note: "Full fee", date: "2023-11-15" },
  { id: "p15", case_id: "case-12", due_id: "", amount: 15000, mode: "UPI", reference: "", note: "Advance", date: format(subDays(base, 2), "yyyy-MM-dd") },
  { id: "p16", case_id: "case-3", due_id: "due-4", amount: 25000, mode: "UPI", reference: "UPI 551203984411", note: "Part payment", date: day(-3) },
  { id: "p17", case_id: "case-2", due_id: "due-18", amount: 20000, mode: "Cash", reference: "", note: "", date: day(-10) },
  { id: "p18", case_id: "case-7", due_id: "due-19", amount: 50000, mode: "Bank transfer", reference: "NEFT N1182734", note: "", date: day(-19) },
]

// Fee schedule. Status (overdue, part paid, paid) is worked out from linked payments.
export const demoDues = [
  { id: "due-1", case_id: "case-1", description: "Second instalment", amount: 30000, due_date: day(-23), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 2, last_reminded_at: daysAgo(5), created_at: daysAgo(90) },
  { id: "due-2", case_id: "case-1", description: "Final instalment", amount: 30000, due_date: day(20), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(90) },
  { id: "due-3", case_id: "case-2", description: "Balance before settlement", amount: 10000, due_date: day(0), notes: "Client said she will pay at the mediation centre.", waived: false, waive_reason: "", original_due_date: "", reminder_count: 1, last_reminded_at: daysAgo(2), created_at: daysAgo(40) },
  { id: "due-4", case_id: "case-3", description: "Instalment 2 of 3", amount: 75000, due_date: day(-8), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 1, last_reminded_at: daysAgo(6), created_at: daysAgo(120) },
  { id: "due-5", case_id: "case-3", description: "Instalment 3 of 3", amount: 75000, due_date: day(22), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(120) },
  { id: "due-6", case_id: "case-4", description: "Appearance fee (3 hearings)", amount: 20000, due_date: day(-47), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 3, last_reminded_at: daysAgo(12), created_at: daysAgo(80) },
  { id: "due-7", case_id: "case-7", description: "Evidence stage fee", amount: 50000, due_date: day(3), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(30) },
  { id: "due-8", case_id: "case-7", description: "Final arguments fee", amount: 25000, due_date: day(35), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(30) },
  { id: "due-9", case_id: "case-8", description: "Second instalment", amount: 30000, due_date: day(-2), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 1, last_reminded_at: daysAgo(1), created_at: daysAgo(60) },
  { id: "due-10", case_id: "case-8", description: "Third instalment", amount: 30000, due_date: day(28), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(60) },
  { id: "due-11", case_id: "case-10", description: "Sessions trial retainer", amount: 50000, due_date: day(-65), notes: "Family says crop money comes next month.", waived: false, waive_reason: "", original_due_date: "", reminder_count: 4, last_reminded_at: daysAgo(9), created_at: daysAgo(100) },
  { id: "due-12", case_id: "case-11", description: "High Court bail hearing fee", amount: 100000, due_date: day(1), notes: "Son will transfer by NEFT.", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(20) },
  { id: "due-13", case_id: "case-12", description: "Balance fee", amount: 15000, due_date: day(12), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(2) },
  { id: "due-14", case_id: "case-15", description: "Complaint filing fee", amount: 35000, due_date: day(-110), notes: "", waived: false, waive_reason: "", original_due_date: day(-140), reminder_count: 5, last_reminded_at: daysAgo(20), created_at: daysAgo(170) },
  { id: "due-15", case_id: "case-5", description: "Full fee", amount: 120000, due_date: "2023-09-12", notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: "2023-09-10T14:00:00Z" },
  { id: "due-16", case_id: "case-16", description: "Clerkage", amount: 5000, due_date: day(-15), notes: "", waived: true, waive_reason: "Waived as a courtesy for an old client", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(40) },
  { id: "due-17", case_id: "case-6", description: "Bail application fee", amount: 40000, due_date: day(-5), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(25) },
  { id: "due-18", case_id: "case-2", description: "First instalment", amount: 20000, due_date: day(-12), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(40) },
  { id: "due-19", case_id: "case-7", description: "Replication drafting fee", amount: 50000, due_date: day(-21), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 1, last_reminded_at: daysAgo(22), created_at: daysAgo(45) },
  { id: "due-20", case_id: "case-16", description: "Succession petition fee", amount: 35000, due_date: day(6), notes: "", waived: false, waive_reason: "", original_due_date: "", reminder_count: 0, last_reminded_at: "", created_at: daysAgo(10) },
]

export const demoCommLogs = [
  { id: "cl1", client_id: "c1", channel: "Call", summary: "Discussed next date. Client will arrange witness transport.", created_at: daysAgo(5) },
  { id: "cl2", client_id: "c11", channel: "WhatsApp", summary: "Son shared custody certificate from jail superintendent.", created_at: daysAgo(3) },
  { id: "cl3", client_id: "c5", channel: "WhatsApp", summary: "Sent copy of written arguments for review.", created_at: daysAgo(20) },
]

export const demoActivity = [
  { id: "a1", lawyer_id: "lawyer-1", action_type: "case_updated", entity_type: "case", entity_id: "case-1", description: "Added hearing notes for CRL/204/2024", created_at: ago(2) },
  { id: "a2", lawyer_id: "lawyer-1", action_type: "document_uploaded", entity_type: "document", entity_id: "doc-15", description: "Uploaded marriage certificate in HMA/89/2024", created_at: ago(5) },
  { id: "a3", lawyer_id: "lawyer-1", action_type: "notice_sent", entity_type: "notice", entity_id: "n1", description: "Sent demand notice to Mahesh Trading Co.", created_at: ago(8) },
  { id: "a4", lawyer_id: "lawyer-1", action_type: "client_added", entity_type: "client", entity_id: "c12", description: "New client Anita Malik onboarded", created_at: ago(26) },
  { id: "a5", lawyer_id: "lawyer-1", action_type: "case_updated", entity_type: "case", entity_id: "case-11", description: "Filed HC bail petition in CRM-M/4120/2024", created_at: ago(30) },
  { id: "a6", lawyer_id: "lawyer-1", action_type: "hearing_added", entity_type: "hearing", entity_id: "h7", description: "Next date fixed in GW/123/2024", created_at: ago(50) },
  { id: "a7", lawyer_id: "lawyer-1", action_type: "payment_received", entity_type: "payment", entity_id: "p15", description: "Received ₹15,000 from Anita Malik", created_at: ago(52) },
  { id: "a8", lawyer_id: "lawyer-1", action_type: "note_added", entity_type: "note", entity_id: "note-5", description: "Added case note to CRM-M/4120/2024", created_at: ago(72) },
  { id: "a9", lawyer_id: "lawyer-1", action_type: "case_created", entity_type: "case", entity_id: "case-12", description: "New case: consumer complaint for Anita Malik", created_at: ago(96) },
  { id: "a10", lawyer_id: "lawyer-1", action_type: "notice_sent", entity_type: "notice", entity_id: "n2", description: "Sent Section 138 notice to Kapoor Industries", created_at: ago(120) },
]

export const demoDeadlines = [
  { id: "dl-1", case_id: "case-11", title: "File written submissions (NDPS bail)", due_date: day(1), case_number: "CRM-M/4120/2024", client: "Dharam Singh Nain" },
  { id: "dl-2", case_id: "case-7", title: "File replication in money recovery suit", due_date: day(2), case_number: "CS/234/2024", client: "Rajesh Dhankar" },
  { id: "dl-3", case_id: "case-12", title: "Submit documents to Consumer Forum", due_date: day(5), case_number: "CC/678/2024", client: "Anita Malik" },
  { id: "dl-4", case_id: "case-15", title: "Complaint limitation (30 days after notice period)", due_date: day(8), case_number: "NACT/123/2024", client: "Rajesh Dhankar" },
  { id: "dl-5", case_id: "case-16", title: "Objection period ends, succession certificate", due_date: day(12), case_number: "SUCC/901/2024", client: "Harinder Pal Singh" },
]

export type NoticeTemplateIcon = "demand" | "eviction" | "reply" | "cease" | "divorce" | "bail" | "vakalatnama" | "custom"

export const noticeTemplates: { id: string; title: string; icon: NoticeTemplateIcon; description: string; fields: string[] }[] = [
  { id: "t1", title: "Demand Notice", icon: "demand", description: "Recovery of money, dues or outstanding amounts", fields: ["amount", "due_date"] },
  { id: "t2", title: "Section 138 NI Act Notice", icon: "demand", description: "Cheque dishonour. Must be sent within 30 days of the return memo", fields: ["amount", "cheque"] },
  { id: "t3", title: "Eviction Notice", icon: "eviction", description: "Rent default or unlawful possession of premises", fields: ["property_address"] },
  { id: "t4", title: "Legal Reply", icon: "reply", description: "Reply to a legal notice received by your client", fields: [] },
  { id: "t5", title: "Cease & Desist", icon: "cease", description: "Defamation, IP infringement or unlawful acts", fields: [] },
  { id: "t6", title: "Divorce Petition Draft", icon: "divorce", description: "Petition under the Hindu Marriage Act", fields: ["grounds"] },
  { id: "t7", title: "Bail Application", icon: "bail", description: "Regular or anticipatory bail (BNSS / CrPC)", fields: ["fir_number", "section", "grounds"] },
  { id: "t8", title: "Vakalatnama", icon: "vakalatnama", description: "Authority for the advocate to appear for the client", fields: [] },
  { id: "t9", title: "Custom Notice", icon: "custom", description: "Start from a blank format", fields: [] },
]
