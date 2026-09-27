"use client"
// Citation verification store (simulates Supabase citation_verifications table)
import { subDays } from "date-fns"

const daysAgoISO = (days: number) => subDays(new Date(), days).toISOString()

export interface CitationResult {
  raw_text: string
  case_name: string
  citation_number: string
  year: string
  court: string
  context: string
  status: "VERIFIED" | "SUSPICIOUS" | "HALLUCINATED" | "NOT_FOUND"
  confidence: number
  actual_case_name?: string
  actual_citation?: string
  date?: string
  brief_summary?: string
  issue?: string
  suggestion?: string
  manually_verified?: boolean
}

export interface CitationVerification {
  id: string
  lawyer_id: string
  case_id: string | null
  document_type: string
  document_text: string
  results: CitationResult[]
  overall_status: "SAFE" | "REVIEW_NEEDED" | "HIGH_RISK"
  risk_score: number
  citations_found: number
  citations_verified: number
  citations_flagged: number
  citations_hallucinated: number
  created_at: string
  title?: string
}

// Demo verification data
const demoCitationVerifications: CitationVerification[] = [
  {
    id: "cv-1",
    lawyer_id: "lawyer-1",
    case_id: "case-11",
    document_type: "Bail Application",
    document_text: "In the matter of bail under NDPS Act...",
    title: "NDPS Bail Application - Dharam Singh",
    results: [
      {
        raw_text: "Tofan Singh vs State of Tamil Nadu (2021) 4 SCC 1",
        case_name: "Tofan Singh vs State of Tamil Nadu",
        citation_number: "(2021) 4 SCC 1",
        year: "2021",
        court: "Supreme Court of India",
        context: "As held in Tofan Singh vs State of Tamil Nadu (2021) 4 SCC 1, the confession recorded under Section 67 NDPS Act is inadmissible.",
        status: "VERIFIED",
        confidence: 97,
        actual_case_name: "Tofan Singh vs State of Tamil Nadu",
        actual_citation: "(2021) 4 SCC 1",
        date: "2021-01-29",
        brief_summary: "The Supreme Court held that statements recorded under Section 67 of the NDPS Act are not confessions under Section 25 of the Evidence Act and are hit by Sections 25 and 26 of the Indian Evidence Act.",
        suggestion: "Citation is correct. Safe to use."
      },
      {
        raw_text: "Narcotics Control Bureau vs Kishan Lal (1991) 1 SCC 705",
        case_name: "Narcotics Control Bureau vs Kishan Lal",
        citation_number: "(1991) 1 SCC 705",
        year: "1991",
        court: "Supreme Court of India",
        context: "The principles laid down in NCB vs Kishan Lal regarding bail in NDPS matters",
        status: "VERIFIED",
        confidence: 95,
        actual_case_name: "Narcotics Control Bureau vs Kishan Lal",
        actual_citation: "(1991) 1 SCC 705",
        date: "1991-01-11",
        brief_summary: "The Supreme Court laid down principles for grant of bail in NDPS cases, emphasizing the twin conditions under Section 37 of the NDPS Act.",
        suggestion: "Citation is correct. Safe to use."
      },
      {
        raw_text: "Union of India vs Ram Samujh AIR 1999 SC 2020",
        case_name: "Union of India vs Ram Samujh",
        citation_number: "AIR 1999 SC 2020",
        year: "1999",
        court: "Supreme Court of India",
        context: "Following the ratio in Union of India vs Ram Samujh, the quantity involved is relevant for bail consideration",
        status: "SUSPICIOUS",
        confidence: 62,
        actual_case_name: "Union of India vs Ram Samujh",
        actual_citation: "AIR 1999 SC 2249",
        issue: "The AIR citation number appears incorrect. The correct citation is AIR 1999 SC 2249, not AIR 1999 SC 2020.",
        suggestion: "Verify the correct AIR citation number. The case exists but the citation reference may be wrong."
      }
    ],
    overall_status: "REVIEW_NEEDED",
    risk_score: 35,
    citations_found: 3,
    citations_verified: 2,
    citations_flagged: 1,
    citations_hallucinated: 0,
    created_at: daysAgoISO(1)
  },
  {
    id: "cv-2",
    lawyer_id: "lawyer-1",
    case_id: "case-1",
    document_type: "Written Submission",
    document_text: "Written submissions in CRL/204/2024...",
    title: "Written Submissions - Sharma Cheating Case",
    results: [
      {
        raw_text: "Arnesh Kumar vs State of Bihar (2014) 8 SCC 273",
        case_name: "Arnesh Kumar vs State of Bihar",
        citation_number: "(2014) 8 SCC 273",
        year: "2014",
        court: "Supreme Court of India",
        context: "As per the guidelines in Arnesh Kumar vs State of Bihar, arrest should be the last resort",
        status: "VERIFIED",
        confidence: 99,
        actual_case_name: "Arnesh Kumar vs State of Bihar",
        actual_citation: "(2014) 8 SCC 273",
        date: "2014-07-02",
        brief_summary: "The Supreme Court issued guidelines to prevent unnecessary arrests in cases under Section 498A IPC and similar offences punishable up to 7 years imprisonment.",
        suggestion: "Citation is correct. Safe to use."
      },
      {
        raw_text: "Sushil Kumar Sharma vs Union of India (2005) 6 SCC 281",
        case_name: "Sushil Kumar Sharma vs Union of India",
        citation_number: "(2005) 6 SCC 281",
        year: "2005",
        court: "Supreme Court of India",
        context: "The Supreme Court in Sushil Kumar Sharma observed that the provision for anticipatory bail must be liberally construed",
        status: "VERIFIED",
        confidence: 96,
        actual_case_name: "Sushil Kumar Sharma vs Union of India",
        actual_citation: "(2005) 6 SCC 281",
        date: "2005-01-19",
        brief_summary: "The Court acknowledged the misuse of Section 498A IPC while holding the provision constitutionally valid.",
        suggestion: "Citation is correct. Safe to use."
      },
      {
        raw_text: "Rajiv Thapar vs Madan Lal Kapoor AIR 2015 SC 3480",
        case_name: "Rajiv Thapar vs Madan Lal Kapoor",
        citation_number: "AIR 2015 SC 3480",
        year: "2015",
        court: "Supreme Court of India",
        context: "The quashing parameters established in Rajiv Thapar vs Madan Lal Kapoor",
        status: "VERIFIED",
        confidence: 91,
        actual_case_name: "Rajiv Thapar vs Madan Lal Kapoor",
        actual_citation: "(2013) 3 SCC 330",
        date: "2013-01-16",
        brief_summary: "The Supreme Court laid down a step-by-step methodology for courts to adopt while considering quashing of criminal proceedings under Section 482 CrPC.",
        suggestion: "Citation is correct but the AIR number should be verified. The SCC citation is (2013) 3 SCC 330."
      }
    ],
    overall_status: "SAFE",
    risk_score: 12,
    citations_found: 3,
    citations_verified: 3,
    citations_flagged: 0,
    citations_hallucinated: 0,
    created_at: daysAgoISO(2)
  },
  {
    id: "cv-3",
    lawyer_id: "lawyer-1",
    case_id: "case-3",
    document_type: "Petition",
    document_text: "Writ petition challenging land acquisition...",
    title: "Land Acquisition Writ - Hooda vs HUDA",
    results: [
      {
        raw_text: "Inderjit Barua vs State of Assam (1983) 2 SCC 91",
        case_name: "Inderjit Barua vs State of Assam",
        citation_number: "(1983) 2 SCC 91",
        year: "1983",
        court: "Supreme Court of India",
        context: "As held in Inderjit Barua vs State of Assam regarding compensation for land acquisition",
        status: "VERIFIED",
        confidence: 88,
        actual_case_name: "Inderjit Barua vs State of Assam",
        actual_citation: "(1983) 2 SCC 91",
        date: "1983-02-15",
        brief_summary: "The Court held that compensation must be determined based on market value of the land at the time of notification.",
        suggestion: "Citation is correct. Safe to use."
      },
      {
        raw_text: "Dharampal vs State of Haryana AIR 2023 SC 4567",
        case_name: "Dharampal vs State of Haryana",
        citation_number: "AIR 2023 SC 4567",
        year: "2023",
        court: "Supreme Court of India",
        context: "The recent ruling in Dharampal vs State of Haryana established enhanced compensation rights",
        status: "HALLUCINATED",
        confidence: 8,
        issue: "This case does not exist in any Indian court database. The citation appears to be entirely fabricated by AI. No case named 'Dharampal vs State of Haryana' with AIR 2023 SC 4567 exists.",
        suggestion: "Remove this citation immediately. Do not use in any court filing. Consider replacing with Pune Municipal Corporation vs Harakchand (2014) 3 SCC 183 for similar principles."
      },
      {
        raw_text: "Collector of Lakhimpur vs Bhuban Chandra Dutta AIR 1971 SC 2015",
        case_name: "Collector of Lakhimpur vs Bhuban Chandra Dutta",
        citation_number: "AIR 1971 SC 2015",
        year: "1971",
        court: "Supreme Court of India",
        context: "The principle established in Collector of Lakhimpur regarding fair market value",
        status: "VERIFIED",
        confidence: 93,
        actual_case_name: "Special Land Acquisition Officer vs Adinarayana Setty",
        actual_citation: "AIR 1959 SC 429",
        date: "1959-01-01",
        brief_summary: "Landmark case on principles of determining market value in land acquisition cases.",
        suggestion: "The citation number may be misattributed. Please verify."
      }
    ],
    overall_status: "HIGH_RISK",
    risk_score: 72,
    citations_found: 3,
    citations_verified: 1,
    citations_flagged: 1,
    citations_hallucinated: 1,
    created_at: daysAgoISO(3)
  },
  {
    id: "cv-4",
    lawyer_id: "lawyer-1",
    case_id: null,
    document_type: "Legal Notice",
    document_text: "Legal notice for property dispute...",
    title: "Property Dispute Legal Notice Draft",
    results: [
      {
        raw_text: "K.T. Plantation Pvt Ltd vs State of Karnataka (2011) 9 SCC 1",
        case_name: "K.T. Plantation Pvt Ltd vs State of Karnataka",
        citation_number: "(2011) 9 SCC 1",
        year: "2011",
        court: "Supreme Court of India",
        context: "The eminent domain principles in K.T. Plantation",
        status: "VERIFIED",
        confidence: 94,
        actual_case_name: "K.T. Plantation Pvt Ltd vs State of Karnataka",
        actual_citation: "(2011) 9 SCC 1",
        date: "2011-09-28",
        brief_summary: "The Constitution Bench considered the scope of eminent domain and held that Article 300A requires the State to follow due process of law for deprivation of property.",
        suggestion: "Citation is correct. Safe to use."
      },
      {
        raw_text: "Nair Service Society vs State of Kerala AIR 2007 SC 2109",
        case_name: "Nair Service Society vs State of Kerala",
        citation_number: "AIR 2007 SC 2109",
        year: "2007",
        court: "Supreme Court of India",
        context: "Following the principles in Nair Service Society vs State of Kerala",
        status: "VERIFIED",
        confidence: 90,
        actual_case_name: "Nair Service Society vs State of Kerala",
        actual_citation: "AIR 2007 SC 2109",
        date: "2007-04-19",
        brief_summary: "The Court discussed the scope of Article 300A and the requirement of authority of law for deprivation of property.",
        suggestion: "Citation is correct. Safe to use."
      }
    ],
    overall_status: "SAFE",
    risk_score: 8,
    citations_found: 2,
    citations_verified: 2,
    citations_flagged: 0,
    citations_hallucinated: 0,
    created_at: daysAgoISO(4)
  },
  {
    id: "cv-5",
    lawyer_id: "lawyer-1",
    case_id: "case-8",
    document_type: "Written Submission",
    document_text: "In the matter of custody...",
    title: "Custody Arguments - Preeti Garg",
    results: [
      {
        raw_text: "Gaurav Nagpal vs Sumedha Nagpal (2009) 1 SCC 42",
        case_name: "Gaurav Nagpal vs Sumedha Nagpal",
        citation_number: "(2009) 1 SCC 42",
        year: "2009",
        court: "Supreme Court of India",
        context: "The welfare of the child principle as established in Gaurav Nagpal",
        status: "VERIFIED",
        confidence: 98,
        actual_case_name: "Gaurav Nagpal vs Sumedha Nagpal",
        actual_citation: "(2009) 1 SCC 42",
        date: "2008-11-17",
        brief_summary: "The Supreme Court held that in custody matters, the paramount consideration is the welfare and interest of the child, not the rights of the parents.",
        suggestion: "Citation is correct. Safe to use."
      }
    ],
    overall_status: "SAFE",
    risk_score: 5,
    citations_found: 1,
    citations_verified: 1,
    citations_flagged: 0,
    citations_hallucinated: 0,
    created_at: daysAgoISO(6)
  }
]

let verifications = [...demoCitationVerifications]

// ---- Citation Verifications ----
export const getCitationVerifications = () => verifications
export const getCitationVerification = (id: string) => verifications.find(v => v.id === id)
export const addCitationVerification = (v: CitationVerification) => {
  verifications = [v, ...verifications]
  return v
}

// ---- Stats for Dashboard ----
export const getCitationDashboardStats = () => {
  const now = new Date()
  const thisMonth = verifications.filter(v => {
    const d = new Date(v.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const thisWeek = verifications.filter(v => {
    const d = new Date(v.created_at)
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  })

  const totalVerifiedThisMonth = thisMonth.reduce((acc, v) => acc + v.citations_verified, 0)
  const totalFlaggedThisWeek = thisWeek.reduce((acc, v) => acc + v.citations_flagged + v.citations_hallucinated, 0)
  const hasUnverifiedDocs = thisWeek.some(v => v.overall_status === "HIGH_RISK" || v.overall_status === "REVIEW_NEEDED")
  const unverifiedCount = thisWeek.filter(v => v.overall_status === "HIGH_RISK" || v.overall_status === "REVIEW_NEEDED").length

  return {
    totalVerifiedThisMonth,
    totalFlaggedThisWeek,
    hasUnverifiedDocs,
    unverifiedCount,
  }
}

export const getRecentVerifications = (limit = 5) => {
  return verifications.slice(0, limit)
}
