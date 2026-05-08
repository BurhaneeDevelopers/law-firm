// Demo data seeded for realistic Indian law firm scenario
export const demoLawyer = {
  id: "lawyer-1",
  name: "Mahipal Yadav",
  email: "mahipal.yadav@VakilOS.in",
  phone: "+91 98765 43210",
  bar_council_no: "D/3452/2014",
  enrollment_no: "HR/123/2014",
  firm_name: "Yadav & Associates",
  firm_address: "Chamber No. 42, Rohtak District Court, Haryana - 124001",
  specializations: ["Criminal Law", "Property Disputes", "Family Law"],
  courts: ["Rohtak District Court", "Punjab & Haryana High Court"],
  languages: ["Hindi", "English", "Haryanvi"],
  avatar: null,
};

export const demoClients = [
  { id: "c1", lawyer_id: "lawyer-1", full_name: "Ramesh Kumar Sharma", phone: "+91 98112 34567", email: "ramesh.sharma@gmail.com", address: "Village Asthal Bohar, Rohtak, Haryana", id_proof_type: "Aadhaar", id_proof_number: "4521 8963 1254", referred_by: "Direct", notes: "Long-standing client. Handle with care.", created_at: "2024-01-15T09:00:00Z" },
  { id: "c2", lawyer_id: "lawyer-1", full_name: "Sunita Devi Yadav", phone: "+91 97343 56789", email: "sunita.yadav@yahoo.co.in", address: "H.No. 45, Shastri Nagar, Rohtak", id_proof_type: "Voter ID", id_proof_number: "WQR/34/2008/023456", referred_by: "Ramesh Kumar", notes: "Divorce case - sensitive matter", created_at: "2024-02-03T10:30:00Z" },
  { id: "c3", lawyer_id: "lawyer-1", full_name: "Vijay Singh Hooda", phone: "+91 94563 12345", email: "vijayhooda@outlook.com", address: "Plot No. 12, Sector 4, Bahadurgarh", id_proof_type: "PAN Card", id_proof_number: "BXPVH4321K", referred_by: "Bar Association", notes: "Property developer, multiple disputes", created_at: "2024-02-18T11:00:00Z" },
  { id: "c4", lawyer_id: "lawyer-1", full_name: "Meena Rani Bansal", phone: "+91 93456 78901", email: "", address: "Near Old Bus Stand, Jhajjar, Haryana", id_proof_type: "Aadhaar", id_proof_number: "8734 5612 9023", referred_by: "Sunita Devi", notes: "", created_at: "2024-03-05T09:45:00Z" },
  { id: "c5", lawyer_id: "lawyer-1", full_name: "Harinder Pal Singh", phone: "+91 99876 54321", email: "harinder.pal@gmail.com", address: "House 78, Civil Lines, Rohtak", id_proof_type: "Passport", id_proof_number: "P4521938", referred_by: "Direct", notes: "NRI client - available on WhatsApp only", created_at: "2024-03-20T14:00:00Z" },
  { id: "c6", lawyer_id: "lawyer-1", full_name: "Santosh Kumari", phone: "+91 96321 09876", email: "santosh.k@rediffmail.com", address: "Village Mokhra, Rohtak", id_proof_type: "Aadhaar", id_proof_number: "6523 1254 8763", referred_by: "Vijay Singh", notes: "", created_at: "2024-04-01T10:00:00Z" },
  { id: "c7", lawyer_id: "lawyer-1", full_name: "Rajesh Dhankar", phone: "+91 91234 56789", email: "rajesh.dhankar@gmail.com", address: "Dhankar Bhavan, Sonipat Road, Rohtak", id_proof_type: "Driving Licence", id_proof_number: "HR-04-2019-0123456", referred_by: "Bar Association", notes: "Businessperson, prompt payment", created_at: "2024-04-10T11:30:00Z" },
  { id: "c8", lawyer_id: "lawyer-1", full_name: "Preeti Garg", phone: "+91 98543 21098", email: "preeti.garg@gmail.com", address: "Flat 3B, Green Park Colony, Rohtak", id_proof_type: "Aadhaar", id_proof_number: "2345 6789 0123", referred_by: "Harinder Pal", notes: "Domestic violence case", created_at: "2024-04-22T09:00:00Z" },
  { id: "c9", lawyer_id: "lawyer-1", full_name: "Mohan Lal Verma", phone: "+91 92345 67890", email: "", address: "Village Kheri Khurd, Jhajjar", id_proof_type: "Voter ID", id_proof_number: "ABC/12/3456", referred_by: "Direct", notes: "", created_at: "2024-05-05T10:00:00Z" },
  { id: "c10", lawyer_id: "lawyer-1", full_name: "Kavita Sheoran", phone: "+91 87654 32109", email: "kavita.sheoran@gmail.com", address: "H.No. 234, Sector 2, Rohtak", id_proof_type: "Aadhaar", id_proof_number: "9876 5432 1098", referred_by: "Rajesh Dhankar", notes: "", created_at: "2024-05-15T11:00:00Z" },
  { id: "c11", lawyer_id: "lawyer-1", full_name: "Dharam Singh Nain", phone: "+91 99123 45678", email: "dharamsingh@gmail.com", address: "Nain Haveli, Bahadurgarh", id_proof_type: "PAN Card", id_proof_number: "AYKPN1234F", referred_by: "Direct", notes: "Criminal case - urgent priority", created_at: "2024-05-28T09:00:00Z" },
  { id: "c12", lawyer_id: "lawyer-1", full_name: "Anita Malik", phone: "+91 96789 01234", email: "anita.malik@gmail.com", address: "Sector 14, Sonipat", id_proof_type: "Aadhaar", id_proof_number: "3456 7890 1234", referred_by: "Meena Rani", notes: "", created_at: "2024-06-01T10:30:00Z" },
];

export const demoCases = [
  { id: "case-1", lawyer_id: "lawyer-1", client_id: "c1", case_number: "CRL/204/2024", title: "State vs. Ramesh Kumar Sharma — IPC 420 Cheating", case_type: "Criminal", court: "Rohtak District Court", judge: "Hon. Judge R.K. Malik", filing_date: "2024-01-20", status: "Active", priority: "Urgent", opposing_party: "State of Haryana", description: "Accused of cheating a property dealer of ₹12 lakhs via forged documents. Bail granted on 15 Feb 2024.", created_at: "2024-01-20T09:00:00Z" },
  { id: "case-2", lawyer_id: "lawyer-1", client_id: "c2", case_number: "FC/89/2024", title: "Sunita Devi Yadav vs. Suresh Yadav — Divorce Petition", case_type: "Divorce", court: "Family Court, Rohtak", judge: "Hon. Judge Priya Sharma", filing_date: "2024-02-05", status: "Active", priority: "Normal", opposing_party: "Suresh Yadav", description: "Mutual divorce petition under Section 13B HMA. Property partition and child custody pending.", created_at: "2024-02-05T10:00:00Z" },
  { id: "case-3", lawyer_id: "lawyer-1", client_id: "c3", case_number: "CS/312/2024", title: "Vijay Singh Hooda vs. Haryana Housing Board — Land Dispute", case_type: "Property", court: "Punjab & Haryana High Court", judge: "Hon. Justice A.K. Singh", filing_date: "2024-02-20", status: "Hearing Scheduled", priority: "Urgent", opposing_party: "Haryana Urban Development Authority", description: "Disputed 3 acres of agricultural land acquired by HUDA without proper compensation. Stay granted.", created_at: "2024-02-20T11:00:00Z" },
  { id: "case-4", lawyer_id: "lawyer-1", client_id: "c4", case_number: "RCS/456/2024", title: "Meena Rani Bansal vs. Deepak Bansal — Domestic Violence", case_type: "Criminal", court: "Magistrate Court, Jhajjar", judge: "Hon. Magistrate S.K. Rao", filing_date: "2024-03-07", status: "Active", priority: "Urgent", opposing_party: "Deepak Bansal", description: "Protection order under DV Act. Maintenance sought at ₹15,000/month. Ex-parte order in force.", created_at: "2024-03-07T09:00:00Z" },
  { id: "case-5", lawyer_id: "lawyer-1", client_id: "c5", case_number: "CS/178/2023", title: "Harinder Pal Singh vs. Ram Prakash — Property Recovery", case_type: "Civil", court: "Rohtak District Court", judge: "Hon. Judge N.K. Verma", filing_date: "2023-09-10", status: "Judgment Awaited", priority: "Normal", opposing_party: "Ram Prakash & Sons", description: "Recovery of possession of commercial shop No. 12, Main Market Rohtak. Arguments completed.", created_at: "2023-09-10T14:00:00Z" },
  { id: "case-6", lawyer_id: "lawyer-1", client_id: "c6", case_number: "CRL/89/2024", title: "State vs. Santosh Kumari — Land Encroachment", case_type: "Criminal", court: "Rohtak District Court", judge: "Hon. Judge R.K. Malik", filing_date: "2024-04-02", status: "Active", priority: "Normal", opposing_party: "State of Haryana", description: "Encroachment on government land near village pond. Bail applied.", created_at: "2024-04-02T10:00:00Z" },
  { id: "case-7", lawyer_id: "lawyer-1", client_id: "c7", case_number: "CS/234/2024", title: "Rajesh Dhankar vs. Mahesh Trading Co. — Money Recovery", case_type: "Civil", court: "Rohtak District Court", judge: "Hon. Judge V.K. Gupta", filing_date: "2024-04-12", status: "Active", priority: "Normal", opposing_party: "Mahesh Trading Company Pvt. Ltd.", description: "Recovery of ₹45 lakhs against returned cheques. Section 138 NI Act filed simultaneously.", created_at: "2024-04-12T11:00:00Z" },
  { id: "case-8", lawyer_id: "lawyer-1", client_id: "c8", case_number: "FC/123/2024", title: "Preeti Garg vs. Anil Garg — Custody & Maintenance", case_type: "Divorce", court: "Family Court, Rohtak", judge: "Hon. Judge Priya Sharma", filing_date: "2024-04-24", status: "Active", priority: "Urgent", opposing_party: "Anil Garg", description: "Custody of 2 minor children and monthly maintenance of ₹25,000. Interim custody granted.", created_at: "2024-04-24T09:00:00Z" },
  { id: "case-9", lawyer_id: "lawyer-1", client_id: "c9", case_number: "CS/567/2023", title: "Mohan Lal Verma vs. Panchayat — Land Rights", case_type: "Property", court: "Rohtak District Court", judge: "Hon. Judge S.R. Mehta", filing_date: "2023-11-15", status: "Closed", priority: "Normal", opposing_party: "Gram Panchayat, Kheri Khurd", description: "Shamlat land dispute resolved. Decree passed in favour of client on 10 Mar 2024.", created_at: "2023-11-15T10:00:00Z" },
  { id: "case-10", lawyer_id: "lawyer-1", client_id: "c10", case_number: "CRL/345/2024", title: "State vs. Kavita Sheoran — FIR 302 Attempt", case_type: "Criminal", court: "Sessions Court, Rohtak", judge: "Hon. Sessions Judge A.B. Kumar", filing_date: "2024-05-17", status: "Hearing Scheduled", priority: "Urgent", opposing_party: "State of Haryana", description: "Framing of charges pending. Bail application before Sessions Court.", created_at: "2024-05-17T11:00:00Z" },
  { id: "case-11", lawyer_id: "lawyer-1", client_id: "c11", case_number: "CRL/412/2024", title: "Dharam Singh Nain — Bail Application NDPS", case_type: "Criminal", court: "Punjab & Haryana High Court", judge: "Hon. Justice R.K. Sharma", filing_date: "2024-05-30", status: "Active", priority: "Urgent", opposing_party: "Narcotics Control Bureau", description: "Arrested under NDPS Act. High Court bail application filed. Arguments on 10 May 2026.", created_at: "2024-05-30T09:00:00Z" },
  { id: "case-12", lawyer_id: "lawyer-1", client_id: "c12", case_number: "CS/678/2024", title: "Anita Malik vs. Rohini Sectors — Consumer Forum", case_type: "Civil", court: "District Consumer Forum, Sonipat", judge: "Hon. President D.K. Jain", filing_date: "2024-06-03", status: "Active", priority: "Normal", opposing_party: "Rohini Sectors Pvt. Ltd.", description: "Defective flat allotment. Compensation of ₹8 lakhs + interest sought.", created_at: "2024-06-03T10:30:00Z" },
  { id: "case-13", lawyer_id: "lawyer-1", client_id: "c1", case_number: "CS/890/2022", title: "Ramesh Kumar Sharma — Land Partition Suit", case_type: "Property", court: "Rohtak District Court", judge: "Hon. Judge N.K. Verma", filing_date: "2022-08-12", status: "Won", priority: "Normal", opposing_party: "Ramphal Sharma (Brother)", description: "Family partition of ancestral property 14 acres. Decree in favour of client. Execution pending.", created_at: "2022-08-12T10:00:00Z" },
  { id: "case-14", lawyer_id: "lawyer-1", client_id: "c3", case_number: "CRL/56/2023", title: "Vijay Singh Hooda — Anticipatory Bail Application", case_type: "Criminal", court: "Punjab & Haryana High Court", judge: "Hon. Justice P.S. Mann", filing_date: "2023-05-20", status: "Closed", priority: "Normal", opposing_party: "State of Haryana", description: "Anticipatory bail in FIR 234/2023 PS City Rohtak. Granted on 30 May 2023 with conditions.", created_at: "2023-05-20T11:00:00Z" },
  { id: "case-15", lawyer_id: "lawyer-1", client_id: "c7", case_number: "NI/123/2024", title: "Rajesh Dhankar vs. Kapoor Industries — Cheque Dishonour", case_type: "Criminal", court: "Magistrate Court, Rohtak", judge: "Hon. Magistrate R.S. Rana", filing_date: "2024-04-15", status: "Active", priority: "Normal", opposing_party: "Kapoor Industries Ltd.", description: "Section 138 NI Act. Cheque of ₹12 lakhs dishonoured twice. Notice served.", created_at: "2024-04-15T11:00:00Z" },
  { id: "case-16", lawyer_id: "lawyer-1", client_id: "c5", case_number: "CS/901/2024", title: "Harinder Pal Singh — Succession Certificate", case_type: "Civil", court: "Rohtak District Court", judge: "Hon. Judge B.K. Sharma", filing_date: "2024-03-25", status: "Active", priority: "Normal", opposing_party: "N/A", description: "Succession certificate for bank FDs and savings after father's demise. Objection period running.", created_at: "2024-03-25T14:00:00Z" },
  { id: "case-17", lawyer_id: "lawyer-1", client_id: "c2", case_number: "CS/234/2023", title: "Sunita Devi Yadav — Stridhan Recovery", case_type: "Civil", court: "Rohtak District Court", judge: "Hon. Judge V.K. Gupta", filing_date: "2023-12-10", status: "Hearing Scheduled", priority: "Normal", opposing_party: "Suresh Yadav Family", description: "Recovery of jewellery and household items valued ₹8 lakhs. List of items filed.", created_at: "2023-12-10T10:00:00Z" },
  { id: "case-18", lawyer_id: "lawyer-1", client_id: "c4", case_number: "CS/456/2024", title: "Meena Rani Bansal — Maintenance Section 125", case_type: "Civil", court: "Magistrate Court, Jhajjar", judge: "Hon. Magistrate S.K. Rao", filing_date: "2024-03-10", status: "Active", priority: "Normal", opposing_party: "Deepak Bansal", description: "Section 125 CrPC. Claimed monthly maintenance ₹20,000 for herself and son.", created_at: "2024-03-10T09:00:00Z" },
  { id: "case-19", lawyer_id: "lawyer-1", client_id: "c6", case_number: "CS/789/2023", title: "Santosh Kumari — Partition of Agricultural Land", case_type: "Property", court: "Rohtak District Court", judge: "Hon. Judge S.R. Mehta", filing_date: "2023-07-14", status: "Judgment Awaited", priority: "Normal", opposing_party: "Brothers of Santosh Kumari", description: "Partition of 8 acres ancestral land. Arguments completed on 20 Feb 2024.", created_at: "2023-07-14T10:00:00Z" },
  { id: "case-20", lawyer_id: "lawyer-1", client_id: "c8", case_number: "CRL/567/2024", title: "State vs. Anil Garg — IPC 498A Cruelty", case_type: "Criminal", court: "Magistrate Court, Rohtak", judge: "Hon. Magistrate R.S. Rana", filing_date: "2024-04-28", status: "Active", priority: "Urgent", opposing_party: "State of Haryana", description: "FIR filed by Preeti Garg. Accused arrested, bail granted with conditions. Trial stage.", created_at: "2024-04-28T09:00:00Z" },
];

// Fixed dates based on current date 2026-05-07
const fmt = (d: Date) => d.toISOString().split('T')[0];
const today = new Date("2026-05-07");
const tomorrow = new Date("2026-05-08");
const dayAfter = new Date("2026-05-09");
const nextWeek = new Date("2026-05-14");
const yesterday = new Date("2026-05-06");
const lastWeek = new Date("2026-04-30");

export const demoHearings = [
  { id: "h1", case_id: "case-1", date: fmt(today), time: "10:30", court_room: "Court No. 5, Rohtak District Court", purpose: "Argument", outcome_notes: "", reminder_sent: true },
  { id: "h2", case_id: "case-10", date: fmt(today), time: "11:00", court_room: "Sessions Court Hall 2, Rohtak", purpose: "Framing of Charges", outcome_notes: "", reminder_sent: false },
  { id: "h3", case_id: "case-3", date: fmt(today), time: "02:30 PM", court_room: "Punjab & Haryana HC, Court 12", purpose: "Mention", outcome_notes: "", reminder_sent: true },
  { id: "h4", case_id: "case-11", date: fmt(tomorrow), time: "10:00", court_room: "Punjab & Haryana HC, Court 8", purpose: "Argument", outcome_notes: "", reminder_sent: false },
  { id: "h5", case_id: "case-2", date: fmt(tomorrow), time: "11:30", court_room: "Family Court Room 2, Rohtak", purpose: "Mediation", outcome_notes: "", reminder_sent: false },
  { id: "h6", case_id: "case-7", date: fmt(dayAfter), time: "10:00", court_room: "Court No. 3, Rohtak", purpose: "Evidence", outcome_notes: "", reminder_sent: false },
  { id: "h7", case_id: "case-8", date: fmt(nextWeek), time: "11:00", court_room: "Family Court Room 1, Rohtak", purpose: "Argument", outcome_notes: "", reminder_sent: false },
  { id: "h8", case_id: "case-17", date: fmt(nextWeek), time: "02:00 PM", court_room: "Court No. 7, Rohtak", purpose: "Evidence", outcome_notes: "", reminder_sent: false },
  { id: "h9", case_id: "case-1", date: fmt(lastWeek), time: "10:30", court_room: "Court No. 5, Rohtak District Court", purpose: "Bail", outcome_notes: "Bail confirmed. Next date for arguments.", reminder_sent: true },
  { id: "h10", case_id: "case-4", date: fmt(yesterday), time: "11:00", court_room: "Magistrate Court, Jhajjar", purpose: "Ex-parte Order", outcome_notes: "Protection order extended for 3 months.", reminder_sent: true },
];

export const demoDocuments = [
  { id: "doc-1", case_id: "case-1", filename: "Bail_Application_Sharma.pdf", file_url: "#", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-01-22T10:00:00Z", size: "245 KB" },
  { id: "doc-2", case_id: "case-1", filename: "FIR_Copy_204_2024.pdf", file_url: "#", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-01-21T09:00:00Z", size: "123 KB" },
  { id: "doc-3", case_id: "case-2", filename: "Divorce_Petition_FC89.pdf", file_url: "#", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-02-06T10:30:00Z", size: "312 KB" },
  { id: "doc-4", case_id: "case-3", filename: "Land_Records_Hooda.pdf", file_url: "#", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-02-22T11:00:00Z", size: "1.2 MB" },
  { id: "doc-5", case_id: "case-3", filename: "Stay_Order_HC.pdf", file_url: "#", file_type: "PDF", doc_category: "Order", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-03-01T09:00:00Z", size: "89 KB" },
  { id: "doc-6", case_id: "case-4", filename: "DV_Protection_Order.pdf", file_url: "#", file_type: "PDF", doc_category: "Order", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-03-10T10:00:00Z", size: "156 KB" },
  { id: "doc-7", case_id: "case-5", filename: "Property_Documents_Harinder.pdf", file_url: "#", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Mahipal Yadav", created_at: "2023-09-15T11:00:00Z", size: "2.1 MB" },
  { id: "doc-8", case_id: "case-7", filename: "Cheque_Dishonour_Notice.docx", file_url: "#", file_type: "Word", doc_category: "Notice", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-04-14T09:00:00Z", size: "45 KB" },
  { id: "doc-9", case_id: "case-8", filename: "Interim_Custody_Order.pdf", file_url: "#", file_type: "PDF", doc_category: "Order", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-04-30T10:00:00Z", size: "178 KB" },
  { id: "doc-10", case_id: "case-10", filename: "Bail_Application_Kavita.pdf", file_url: "#", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-05-18T11:00:00Z", size: "234 KB" },
  { id: "doc-11", case_id: "case-11", filename: "HC_Bail_Application_NDPS.pdf", file_url: "#", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-06-01T09:00:00Z", size: "289 KB" },
  { id: "doc-12", case_id: "case-12", filename: "Consumer_Complaint_Malik.pdf", file_url: "#", file_type: "PDF", doc_category: "Petition", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-06-04T10:30:00Z", size: "167 KB" },
  { id: "doc-13", case_id: "case-15", filename: "Section138_Notice_Dhankar.pdf", file_url: "#", file_type: "PDF", doc_category: "Notice", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-04-17T09:00:00Z", size: "78 KB" },
  { id: "doc-14", case_id: "case-20", filename: "FIR_498A_Garg.pdf", file_url: "#", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-04-29T10:00:00Z", size: "134 KB" },
  { id: "doc-15", case_id: "case-2", filename: "Marriage_Certificate_Yadav.pdf", file_url: "#", file_type: "PDF", doc_category: "Evidence", uploaded_by: "Adv. Mahipal Yadav", created_at: "2024-02-07T10:00:00Z", size: "245 KB" },
];

export const demoNotices = [
  { id: "n1", case_id: "case-7", lawyer_id: "lawyer-1", title: "Legal Demand Notice — Mahesh Trading Co.", notice_type: "Demand Notice", content: "LEGAL NOTICE\n\nTo,\nMahesh Trading Company Pvt. Ltd.\n\nDear Sir/Ma'am,\n\nUnder instructions and on behalf of my client Shri Rajesh Dhankar...", status: "Sent", created_at: "2024-04-16T10:00:00Z" },
  { id: "n2", case_id: "case-15", lawyer_id: "lawyer-1", title: "Cheque Dishonour Notice — Kapoor Industries", notice_type: "Legal Reply", content: "LEGAL NOTICE UNDER SECTION 138 N.I. ACT\n\nTo,\nKapoor Industries Ltd.\n\nDear Sir...", status: "Sent", created_at: "2024-04-18T09:00:00Z" },
  { id: "n3", case_id: "case-3", lawyer_id: "lawyer-1", title: "Vakalatnama — Hooda vs HUDA", notice_type: "Vakalatnama", content: "VAKALATNAMA\n\nI, Vijay Singh Hooda, hereby appoint and retain Advocate Mahipal Yadav...", status: "Sent", created_at: "2024-02-21T11:00:00Z" },
  { id: "n4", case_id: "case-12", lawyer_id: "lawyer-1", title: "Consumer Notice — Rohini Sectors", notice_type: "Demand Notice", content: "LEGAL NOTICE\n\nTo,\nM/s Rohini Sectors Pvt. Ltd.\n\nDear Sir/Ma'am,\n\nUnder instructions from Smt. Anita Malik...", status: "Draft", created_at: "2024-06-05T10:00:00Z" },
  { id: "n5", case_id: "case-20", lawyer_id: "lawyer-1", title: "Bail Application Notice — Anil Garg", notice_type: "Bail Application", content: "IN THE COURT OF HON. CHIEF JUDICIAL MAGISTRATE, ROHTAK\n\nBail Application Under Section 439 CrPC\n\nIn the matter of: State vs. Anil Garg\nFIR No: 567/2024\n\nApplication for Regular Bail...", status: "Sent", created_at: "2024-04-30T09:00:00Z" },
];

export const demoNotes = [
  { id: "note-1", case_id: "case-1", content: "Client called today. Worried about next hearing. Explained bail conditions. Told him to be present at 10:30 AM on hearing day.", is_pinned: true, created_by: "Adv. Mahipal Yadav", created_at: "2024-03-15T16:00:00Z" },
  { id: "note-2", case_id: "case-1", content: "Prosecution has filed list of witnesses. Need to challenge witness No. 3 who is related to complainant.", is_pinned: false, created_by: "Adv. Mahipal Yadav", created_at: "2024-04-02T11:00:00Z" },
  { id: "note-3", case_id: "case-2", content: "Both parties agreed in mediation to 40/60 split of property. Draft decree to be prepared next week.", is_pinned: true, created_by: "Adv. Mahipal Yadav", created_at: "2024-05-10T14:00:00Z" },
  { id: "note-4", case_id: "case-3", content: "HC granted stay but conditions include ₹50,000 deposit. Client has deposited the amount - keep receipt safe.", is_pinned: true, created_by: "Adv. Mahipal Yadav", created_at: "2024-03-01T09:30:00Z" },
  { id: "note-5", case_id: "case-11", content: "Arguments listed for 10 May 2026. Prepare detailed written submissions on previous bail precedents in NDPS matters.", is_pinned: false, created_by: "Adv. Mahipal Yadav", created_at: "2026-05-01T10:00:00Z" },
];

export const demoActivity = [
  { id: "a1", lawyer_id: "lawyer-1", action_type: "case_updated", entity_type: "case", entity_id: "case-1", description: "Added hearing notes for CRL/204/2024", created_at: "2026-05-07T05:00:00Z" },
  { id: "a2", lawyer_id: "lawyer-1", action_type: "document_uploaded", entity_type: "document", entity_id: "doc-15", description: "Uploaded Marriage Certificate in FC/89/2024", created_at: "2026-05-07T03:00:00Z" },
  { id: "a3", lawyer_id: "lawyer-1", action_type: "notice_sent", entity_type: "notice", entity_id: "n1", description: "Sent demand notice to Mahesh Trading Co.", created_at: "2026-05-07T01:00:00Z" },
  { id: "a4", lawyer_id: "lawyer-1", action_type: "client_added", entity_type: "client", entity_id: "c12", description: "New client Anita Malik onboarded", created_at: "2026-05-06T07:00:00Z" },
  { id: "a5", lawyer_id: "lawyer-1", action_type: "case_updated", entity_type: "case", entity_id: "case-11", description: "Filed HC Bail Application in CRL/412/2024", created_at: "2026-05-06T05:00:00Z" },
  { id: "a6", lawyer_id: "lawyer-1", action_type: "hearing_added", entity_type: "hearing", entity_id: "h7", description: "Added hearing for Family Court on next week", created_at: "2026-05-05T07:00:00Z" },
  { id: "a7", lawyer_id: "lawyer-1", action_type: "note_added", entity_type: "note", entity_id: "note-5", description: "Added case note to CRL/412/2024", created_at: "2026-05-04T07:00:00Z" },
  { id: "a8", lawyer_id: "lawyer-1", action_type: "document_uploaded", entity_type: "document", entity_id: "doc-11", description: "Uploaded HC Bail Application NDPS PDF", created_at: "2026-05-03T07:00:00Z" },
  { id: "a9", lawyer_id: "lawyer-1", action_type: "case_created", entity_type: "case", entity_id: "case-12", description: "New case filed: Consumer Forum - Anita Malik", created_at: "2026-05-02T07:00:00Z" },
  { id: "a10", lawyer_id: "lawyer-1", action_type: "notice_sent", entity_type: "notice", entity_id: "n2", description: "Sent Section 138 notice to Kapoor Industries", created_at: "2026-05-01T07:00:00Z" },
];

export const demoAIConversation = [
  { role: "user", content: "Summarize my most urgent cases today", timestamp: "2026-05-07T06:00:00Z" },
  { role: "assistant", content: "**Urgent Cases Summary — Advocate Mahipal Yadav**\n\nYou have **4 urgent cases** requiring immediate attention:\n\n1. **CRL/204/2024** — State vs. Ramesh Kumar Sharma\n   - Hearing **today at 10:30 AM**, Court No. 5, Rohtak\n   - Stage: Arguments on bail conditions\n   - Action: Client confirmed present\n\n2. **CRL/345/2024** — State vs. Kavita Sheoran\n   - Hearing **today at 11:00 AM**, Sessions Court\n   - Stage: Framing of charges — critical stage\n   - Action: Written submissions to be filed\n\n3. **CRL/412/2024** — Dharam Singh Nain (NDPS)\n   - Hearing **tomorrow at 10:00 AM**, Punjab & Haryana HC\n   - Stage: Bail arguments\n   - Action: Prepare detailed submissions on NDPS bail precedents\n\n4. **FC/123/2024** — Preeti Garg vs. Anil Garg\n   - Hearing next week, Family Court\n   - Stage: Child custody arguments\n   - Note: Client emotionally vulnerable — handle sensitively\n\n*This summary is for your review. Please verify all dates with court cause lists.*", timestamp: "2026-05-07T06:01:00Z" },
];

export const demoDeadlines = [
  { id: "dl-1", case_id: "case-11", title: "File Written Submissions — HC NDPS Bail", due_date: "2026-05-08", case_number: "CRL/412/2024", client: "Dharam Singh Nain" },
  { id: "dl-2", case_id: "case-7", title: "File Replication — Money Recovery Suit", due_date: "2026-05-09", case_number: "CS/234/2024", client: "Rajesh Dhankar" },
  { id: "dl-3", case_id: "case-12", title: "Submit Documents to Consumer Forum", due_date: "2026-05-12", case_number: "CS/678/2024", client: "Anita Malik" },
  { id: "dl-4", case_id: "case-15", title: "Reply Period for Section 138 Notice", due_date: "2026-05-15", case_number: "NI/123/2024", client: "Rajesh Dhankar" },
  { id: "dl-5", case_id: "case-16", title: "Objection Period Ends — Succession Cert", due_date: "2026-05-19", case_number: "CS/901/2024", client: "Harinder Pal Singh" },
];

export const noticeTemplates = [
  { id: "t1", title: "Demand Notice", icon: "📋", description: "For recovery of money, dues, or outstanding amounts", fields: ["amount", "due_date", "payment_method"] },
  { id: "t2", title: "Eviction Notice", icon: "🏠", description: "For unlawful possession or rent default situations", fields: ["property_address", "tenancy_date", "vacancy_date"] },
  { id: "t3", title: "Legal Reply", icon: "↩️", description: "Reply to legal notice received from opposing party", fields: ["original_notice_date", "reply_points"] },
  { id: "t4", title: "Cease & Desist", icon: "🛑", description: "For IP infringement, defamation, or unlawful acts", fields: ["act_description", "cease_action", "deadline"] },
  { id: "t5", title: "Divorce Petition Draft", icon: "⚖️", description: "Draft for divorce petition under HMA", fields: ["marriage_date", "grounds", "relief_sought"] },
  { id: "t6", title: "Bail Application", icon: "🔑", description: "Application for regular or anticipatory bail", fields: ["fir_number", "section", "grounds"] },
  { id: "t7", title: "Vakalatnama", icon: "📜", description: "Power of attorney appointing advocate", fields: ["court_name", "case_title"] },
  { id: "t8", title: "Custom Notice", icon: "✏️", description: "Fully customizable legal notice format", fields: [] },
];
