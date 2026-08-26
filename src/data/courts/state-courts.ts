import type { StateCourtSystem } from "../../types";

export const stateCourts: StateCourtSystem[] = [
  // Alabama
  {
    stateSlug: "alabama",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction trial court; hears civil cases over $10,000 and all felony criminal cases" },
      { name: "District Court", description: "Limited jurisdiction; civil cases up to $10,000, misdemeanors, small claims" },
      { name: "Probate Court", description: "Wills, estates, guardianships, mental health commitments" },
    ],
    appellateCourts: [
      { name: "Alabama Court of Civil Appeals", description: "Reviews civil and domestic relations cases from circuit courts" },
      { name: "Alabama Court of Criminal Appeals", description: "Reviews all criminal cases from circuit and district courts" },
    ],
    supremeCourt: "Supreme Court of Alabama",
    federalDistricts: [
      { name: "Northern District of Alabama", abbreviation: "N.D. Ala." },
      { name: "Middle District of Alabama", abbreviation: "M.D. Ala." },
      { name: "Southern District of Alabama", abbreviation: "S.D. Ala." },
    ],
    filingPortalUrl: "https://alacourt.gov",
  },
  // Alaska
  {
    stateSlug: "alaska",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction trial court; handles all civil and criminal matters" },
      { name: "District Court", description: "Limited jurisdiction; civil cases up to $100,000, misdemeanors, small claims" },
    ],
    appellateCourts: [
      { name: "Alaska Court of Appeals", description: "Reviews criminal cases, juvenile delinquency, and driver's license revocations" },
    ],
    supremeCourt: "Alaska Supreme Court",
    federalDistricts: [
      { name: "District of Alaska", abbreviation: "D. Alaska" },
    ],
    filingPortalUrl: "https://courts.alaska.gov",
  },
  // Arizona
  {
    stateSlug: "arizona",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases over $10,000, felonies, family law, probate" },
      { name: "Justice Court", description: "Civil cases up to $10,000, misdemeanors, small claims" },
      { name: "Municipal Court", description: "City ordinance violations and Class 1 misdemeanors within municipal limits" },
    ],
    appellateCourts: [
      { name: "Arizona Court of Appeals", description: "Two divisions; Division One (Phoenix) and Division Two (Tucson) review superior court decisions" },
    ],
    supremeCourt: "Arizona Supreme Court",
    federalDistricts: [
      { name: "District of Arizona", abbreviation: "D. Ariz." },
    ],
    filingPortalUrl: "https://www.azcourts.gov",
  },
  // Arkansas
  {
    stateSlug: "arkansas",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil, criminal, domestic, probate, and juvenile matters" },
      { name: "District Court", description: "Limited jurisdiction; civil cases up to $25,000, misdemeanors, small claims" },
    ],
    appellateCourts: [
      { name: "Arkansas Court of Appeals", description: "12-judge intermediate appellate court reviewing circuit court decisions" },
    ],
    supremeCourt: "Arkansas Supreme Court",
    federalDistricts: [
      { name: "Eastern District of Arkansas", abbreviation: "E.D. Ark." },
      { name: "Western District of Arkansas", abbreviation: "W.D. Ark." },
    ],
    filingPortalUrl: "https://courts.arkansas.gov",
  },
  // California
  {
    stateSlug: "california",
    trialCourts: [
      { name: "Superior Court", description: "Unified general jurisdiction trial court in each of 58 counties; handles all civil and criminal matters" },
    ],
    appellateCourts: [
      { name: "Court of Appeal, First Appellate District", description: "Covers San Francisco Bay Area" },
      { name: "Court of Appeal, Second Appellate District", description: "Covers Los Angeles and Ventura" },
      { name: "Court of Appeal, Third Appellate District", description: "Covers Sacramento and surrounding counties" },
      { name: "Court of Appeal, Fourth Appellate District", description: "Covers San Diego, Riverside, and Orange County" },
      { name: "Court of Appeal, Fifth Appellate District", description: "Covers Central Valley" },
      { name: "Court of Appeal, Sixth Appellate District", description: "Covers San Jose/Santa Clara" },
    ],
    supremeCourt: "Supreme Court of California",
    federalDistricts: [
      { name: "Northern District of California", abbreviation: "N.D. Cal." },
      { name: "Eastern District of California", abbreviation: "E.D. Cal." },
      { name: "Central District of California", abbreviation: "C.D. Cal." },
      { name: "Southern District of California", abbreviation: "S.D. Cal." },
    ],
    filingPortalUrl: "https://www.courts.ca.gov",
  },
  // Colorado
  {
    stateSlug: "colorado",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; civil cases over $15,000, felonies, domestic relations, probate" },
      { name: "County Court", description: "Limited jurisdiction; civil cases up to $15,000, misdemeanors, traffic" },
      { name: "Water Court", description: "Specialized court for water rights adjudication in 7 divisions" },
    ],
    appellateCourts: [
      { name: "Colorado Court of Appeals", description: "22-judge intermediate appellate court reviewing district and county court decisions" },
    ],
    supremeCourt: "Colorado Supreme Court",
    federalDistricts: [
      { name: "District of Colorado", abbreviation: "D. Colo." },
    ],
    filingPortalUrl: "https://www.courts.state.co.us",
  },
  // Connecticut
  {
    stateSlug: "connecticut",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; handles all civil, criminal, family, and housing matters" },
      { name: "Probate Court", description: "Decedents' estates, trusts, guardianships, adoptions in each probate district" },
    ],
    appellateCourts: [
      { name: "Appellate Court", description: "9-judge intermediate appellate court; reviews most superior court decisions" },
    ],
    supremeCourt: "Connecticut Supreme Court",
    federalDistricts: [
      { name: "District of Connecticut", abbreviation: "D. Conn." },
    ],
    filingPortalUrl: "https://www.jud.ct.gov",
  },
  // Delaware
  {
    stateSlug: "delaware",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases over $75,000, felonies" },
      { name: "Court of Chancery", description: "Equity jurisdiction; nationally prominent for corporate and business disputes" },
      { name: "Family Court", description: "All matters involving juveniles, domestic relations, and child support" },
      { name: "Court of Common Pleas", description: "Civil cases up to $75,000, lesser criminal offenses" },
      { name: "Justice of the Peace Court", description: "Civil cases up to $25,000, minor criminal offenses, landlord-tenant" },
    ],
    appellateCourts: [],
    supremeCourt: "Delaware Supreme Court",
    federalDistricts: [
      { name: "District of Delaware", abbreviation: "D. Del." },
    ],
    filingPortalUrl: "https://courts.delaware.gov",
  },
  // District of Columbia
  {
    stateSlug: "district-of-columbia",
    trialCourts: [
      { name: "Superior Court of the District of Columbia", description: "General jurisdiction trial court; civil, criminal, family, probate, and tax matters" },
    ],
    appellateCourts: [
      { name: "District of Columbia Court of Appeals", description: "Highest local court; reviews Superior Court decisions and is the final authority on local DC law" },
    ],
    supremeCourt: "District of Columbia Court of Appeals",
    federalDistricts: [
      { name: "District of the District of Columbia", abbreviation: "D.D.C." },
    ],
    filingPortalUrl: "https://www.dccourts.gov",
  },
  // Florida
  {
    stateSlug: "florida",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $30,000, felonies, family law, probate" },
      { name: "County Court", description: "Limited jurisdiction; civil cases up to $30,000, misdemeanors, small claims" },
    ],
    appellateCourts: [
      { name: "First District Court of Appeal", description: "Covers North Florida (Tallahassee)" },
      { name: "Second District Court of Appeal", description: "Covers Southwest Florida (Tampa)" },
      { name: "Third District Court of Appeal", description: "Covers Miami-Dade and Monroe counties" },
      { name: "Fourth District Court of Appeal", description: "Covers Southeast Florida (West Palm Beach)" },
      { name: "Fifth District Court of Appeal", description: "Covers Central Florida (Daytona Beach)" },
      { name: "Sixth District Court of Appeal", description: "Covers Tampa Bay area" },
    ],
    supremeCourt: "Florida Supreme Court",
    federalDistricts: [
      { name: "Northern District of Florida", abbreviation: "N.D. Fla." },
      { name: "Middle District of Florida", abbreviation: "M.D. Fla." },
      { name: "Southern District of Florida", abbreviation: "S.D. Fla." },
    ],
    filingPortalUrl: "https://www.flcourts.gov",
  },
  // Georgia
  {
    stateSlug: "georgia",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases, felonies, domestic relations, equity" },
      { name: "State Court", description: "Limited jurisdiction; civil cases, misdemeanors, some traffic" },
      { name: "Juvenile Court", description: "All matters involving minors" },
      { name: "Probate Court", description: "Wills, estates, guardianships, mental health" },
      { name: "Magistrate Court", description: "Civil cases up to $15,000, issue warrants, preliminary hearings" },
    ],
    appellateCourts: [
      { name: "Georgia Court of Appeals", description: "15-judge intermediate appellate court" },
    ],
    supremeCourt: "Supreme Court of Georgia",
    federalDistricts: [
      { name: "Northern District of Georgia", abbreviation: "N.D. Ga." },
      { name: "Middle District of Georgia", abbreviation: "M.D. Ga." },
      { name: "Southern District of Georgia", abbreviation: "S.D. Ga." },
    ],
    filingPortalUrl: "https://www.gasupreme.us",
  },
  // Hawaii
  {
    stateSlug: "hawaii",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $40,000, felonies, family court division" },
      { name: "District Court", description: "Civil cases up to $40,000, misdemeanors, small claims, traffic" },
    ],
    appellateCourts: [
      { name: "Intermediate Court of Appeals", description: "Reviews circuit and district court decisions" },
    ],
    supremeCourt: "Hawaii Supreme Court",
    federalDistricts: [
      { name: "District of Hawaii", abbreviation: "D. Haw." },
    ],
    filingPortalUrl: "https://www.courts.state.hi.us",
  },
  // Idaho
  {
    stateSlug: "idaho",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; civil cases over $10,000, felonies, domestic relations, probate" },
      { name: "Magistrate Division", description: "Civil cases up to $10,000, misdemeanors, small claims, traffic" },
    ],
    appellateCourts: [
      { name: "Idaho Court of Appeals", description: "Reviews district court decisions; primarily criminal cases" },
    ],
    supremeCourt: "Idaho Supreme Court",
    federalDistricts: [
      { name: "District of Idaho", abbreviation: "D. Idaho" },
    ],
    filingPortalUrl: "https://isc.idaho.gov",
  },
  // Illinois
  {
    stateSlug: "illinois",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; 25 judicial circuits across the state (24 numbered circuits plus the unnumbered Circuit Court of Cook County)" },
    ],
    appellateCourts: [
      { name: "Appellate Court, First District", description: "Covers Cook County (Chicago)" },
      { name: "Appellate Court, Second District", description: "Covers northern Illinois" },
      { name: "Appellate Court, Third District", description: "Covers central-northern Illinois" },
      { name: "Appellate Court, Fourth District", description: "Covers central Illinois" },
      { name: "Appellate Court, Fifth District", description: "Covers southern Illinois" },
    ],
    supremeCourt: "Illinois Supreme Court",
    federalDistricts: [
      { name: "Northern District of Illinois", abbreviation: "N.D. Ill." },
      { name: "Central District of Illinois", abbreviation: "C.D. Ill." },
      { name: "Southern District of Illinois", abbreviation: "S.D. Ill." },
    ],
    filingPortalUrl: "https://www.illinoiscourts.gov",
  },
  // Indiana
  {
    stateSlug: "indiana",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; oldest courts in each county" },
      { name: "Superior Court", description: "General jurisdiction; exists in most counties alongside circuit courts" },
      { name: "Small Claims Court", description: "Civil cases up to $6,000 in Marion County" },
    ],
    appellateCourts: [
      { name: "Indiana Court of Appeals", description: "15-judge intermediate appellate court in five districts" },
      { name: "Indiana Tax Court", description: "Reviews Indiana Department of Revenue decisions" },
    ],
    supremeCourt: "Indiana Supreme Court",
    federalDistricts: [
      { name: "Northern District of Indiana", abbreviation: "N.D. Ind." },
      { name: "Southern District of Indiana", abbreviation: "S.D. Ind." },
    ],
    filingPortalUrl: "https://www.in.gov/courts",
  },
  // Iowa
  {
    stateSlug: "iowa",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; one district court in each of 99 counties" },
      { name: "District Associate Division", description: "Misdemeanors, small claims, simple civil cases" },
    ],
    appellateCourts: [
      { name: "Iowa Court of Appeals", description: "9-judge intermediate appellate court" },
    ],
    supremeCourt: "Iowa Supreme Court",
    federalDistricts: [
      { name: "Northern District of Iowa", abbreviation: "N.D. Iowa" },
      { name: "Southern District of Iowa", abbreviation: "S.D. Iowa" },
    ],
    filingPortalUrl: "https://www.iowacourts.gov",
  },
  // Kansas
  {
    stateSlug: "kansas",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; 31 judicial districts across 105 counties" },
    ],
    appellateCourts: [
      { name: "Kansas Court of Appeals", description: "14-judge intermediate appellate court" },
    ],
    supremeCourt: "Kansas Supreme Court",
    federalDistricts: [
      { name: "District of Kansas", abbreviation: "D. Kan." },
    ],
    filingPortalUrl: "https://www.kscourts.org",
  },
  // Kentucky
  {
    stateSlug: "kentucky",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $5,000, felonies, domestic relations" },
      { name: "District Court", description: "Civil cases up to $5,000, misdemeanors, probate, small claims, juvenile" },
    ],
    appellateCourts: [
      { name: "Kentucky Court of Appeals", description: "14-judge intermediate appellate court" },
    ],
    supremeCourt: "Kentucky Supreme Court",
    federalDistricts: [
      { name: "Eastern District of Kentucky", abbreviation: "E.D. Ky." },
      { name: "Western District of Kentucky", abbreviation: "W.D. Ky." },
    ],
    filingPortalUrl: "https://kycourts.gov",
  },
  // Louisiana
  {
    stateSlug: "louisiana",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; civil and criminal cases at the parish level" },
      { name: "City Court", description: "Limited jurisdiction within city limits; civil cases up to $20,000" },
      { name: "Family Court", description: "Domestic relations in parishes with dedicated family courts" },
      { name: "Juvenile Court", description: "Matters involving minors" },
    ],
    appellateCourts: [
      { name: "Court of Appeal, First Circuit", description: "Covers Baton Rouge and southeast Louisiana" },
      { name: "Court of Appeal, Second Circuit", description: "Covers northern Louisiana" },
      { name: "Court of Appeal, Third Circuit", description: "Covers central and southwest Louisiana" },
      { name: "Court of Appeal, Fourth Circuit", description: "Covers New Orleans and surrounding area" },
      { name: "Court of Appeal, Fifth Circuit", description: "Covers Jefferson and surrounding parishes" },
    ],
    supremeCourt: "Louisiana Supreme Court",
    federalDistricts: [
      { name: "Eastern District of Louisiana", abbreviation: "E.D. La." },
      { name: "Middle District of Louisiana", abbreviation: "M.D. La." },
      { name: "Western District of Louisiana", abbreviation: "W.D. La." },
    ],
    filingPortalUrl: "https://www.lasc.org",
  },
  // Maine
  {
    stateSlug: "maine",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases, jury trials in major criminal cases" },
      { name: "District Court", description: "Civil and criminal cases, small claims, family matters" },
      { name: "Probate Court", description: "Wills, estates, guardianships in each county" },
    ],
    appellateCourts: [],
    supremeCourt: "Maine Supreme Judicial Court",
    federalDistricts: [
      { name: "District of Maine", abbreviation: "D. Me." },
    ],
    filingPortalUrl: "https://www.courts.maine.gov",
  },
  // Maryland
  {
    stateSlug: "maryland",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $30,000, felonies, equity, domestic relations" },
      { name: "District Court", description: "Civil cases up to $30,000, misdemeanors, motor vehicle, landlord-tenant" },
      { name: "Orphans' Court", description: "Probate matters, administration of estates" },
    ],
    appellateCourts: [
      { name: "Appellate Court of Maryland", description: "Intermediate appellate court (formerly Court of Special Appeals)" },
    ],
    supremeCourt: "Supreme Court of Maryland",
    federalDistricts: [
      { name: "District of Maryland", abbreviation: "D. Md." },
    ],
    filingPortalUrl: "https://www.courts.state.md.us",
  },
  // Massachusetts
  {
    stateSlug: "massachusetts",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases over $25,000, major criminal cases" },
      { name: "District Court", description: "Civil cases up to $25,000, misdemeanors, small claims" },
      { name: "Boston Municipal Court", description: "Civil and criminal jurisdiction within Boston" },
      { name: "Probate and Family Court", description: "Domestic relations, probate, adoptions" },
      { name: "Land Court", description: "Specialized court for real property disputes" },
      { name: "Housing Court", description: "Landlord-tenant disputes and housing code enforcement" },
      { name: "Juvenile Court", description: "Matters involving minors" },
    ],
    appellateCourts: [
      { name: "Appeals Court", description: "25-judge intermediate appellate court" },
    ],
    supremeCourt: "Supreme Judicial Court",
    federalDistricts: [
      { name: "District of Massachusetts", abbreviation: "D. Mass." },
    ],
    filingPortalUrl: "https://www.mass.gov/courts",
  },
  // Michigan
  {
    stateSlug: "michigan",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $25,000, felonies, domestic relations" },
      { name: "District Court", description: "Civil cases up to $25,000, misdemeanors, small claims, traffic" },
      { name: "Probate Court", description: "Estates, trusts, guardianships, mental health" },
      { name: "Family Division of Circuit Court", description: "Domestic relations and juvenile matters" },
    ],
    appellateCourts: [
      { name: "Michigan Court of Appeals", description: "24-judge intermediate appellate court" },
    ],
    supremeCourt: "Michigan Supreme Court",
    federalDistricts: [
      { name: "Eastern District of Michigan", abbreviation: "E.D. Mich." },
      { name: "Western District of Michigan", abbreviation: "W.D. Mich." },
    ],
    filingPortalUrl: "https://www.courts.michigan.gov",
  },
  // Minnesota
  {
    stateSlug: "minnesota",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; 10 judicial districts; all civil, criminal, family, and probate matters" },
    ],
    appellateCourts: [
      { name: "Minnesota Court of Appeals", description: "19-judge intermediate appellate court" },
    ],
    supremeCourt: "Minnesota Supreme Court",
    federalDistricts: [
      { name: "District of Minnesota", abbreviation: "D. Minn." },
    ],
    filingPortalUrl: "https://www.mncourts.gov",
  },
  // Mississippi
  {
    stateSlug: "mississippi",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $200, felonies" },
      { name: "Chancery Court", description: "Equity jurisdiction; domestic relations, probate, real property, contract" },
      { name: "County Court", description: "Exists in more populous counties; civil cases up to $200,000" },
      { name: "Justice Court", description: "Civil cases up to $3,500, misdemeanors" },
    ],
    appellateCourts: [
      { name: "Mississippi Court of Appeals", description: "10-judge intermediate appellate court" },
    ],
    supremeCourt: "Mississippi Supreme Court",
    federalDistricts: [
      { name: "Northern District of Mississippi", abbreviation: "N.D. Miss." },
      { name: "Southern District of Mississippi", abbreviation: "S.D. Miss." },
    ],
    filingPortalUrl: "https://courts.ms.gov",
  },
  // Missouri
  {
    stateSlug: "missouri",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; 46 judicial circuits; all civil, criminal, domestic, and probate matters" },
    ],
    appellateCourts: [
      { name: "Missouri Court of Appeals, Eastern District", description: "Covers St. Louis and eastern Missouri" },
      { name: "Missouri Court of Appeals, Western District", description: "Covers Kansas City and western Missouri" },
      { name: "Missouri Court of Appeals, Southern District", description: "Covers southern Missouri" },
    ],
    supremeCourt: "Missouri Supreme Court",
    federalDistricts: [
      { name: "Eastern District of Missouri", abbreviation: "E.D. Mo." },
      { name: "Western District of Missouri", abbreviation: "W.D. Mo." },
    ],
    filingPortalUrl: "https://www.courts.mo.gov",
  },
  // Montana
  {
    stateSlug: "montana",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; one district in each of 56 counties" },
      { name: "Justice Court", description: "Civil cases up to $15,000, misdemeanors, small claims" },
      { name: "City Court", description: "Municipal ordinance violations and city misdemeanors" },
      { name: "Water Court", description: "Adjudicates water rights; statewide jurisdiction" },
    ],
    appellateCourts: [],
    supremeCourt: "Montana Supreme Court",
    federalDistricts: [
      { name: "District of Montana", abbreviation: "D. Mont." },
    ],
    filingPortalUrl: "https://courts.mt.gov",
  },
  // Nebraska
  {
    stateSlug: "nebraska",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; civil cases over $57,910, felonies, domestic relations" },
      { name: "County Court", description: "Civil cases up to $57,910, misdemeanors, probate, small claims" },
    ],
    appellateCourts: [
      { name: "Nebraska Court of Appeals", description: "6-judge intermediate appellate court (sits in three-judge panels)" },
    ],
    supremeCourt: "Nebraska Supreme Court",
    federalDistricts: [
      { name: "District of Nebraska", abbreviation: "D. Neb." },
    ],
    filingPortalUrl: "https://supremecourt.nebraska.gov",
  },
  // Nevada
  {
    stateSlug: "nevada",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; civil cases over $15,000, felonies, domestic relations" },
      { name: "Justice Court", description: "Civil cases up to $15,000, misdemeanors, small claims, traffic" },
      { name: "Municipal Court", description: "Violations of city ordinances" },
      { name: "Family Court Division", description: "Domestic relations and juvenile matters in Clark and Washoe counties" },
    ],
    appellateCourts: [
      { name: "Nevada Court of Appeals", description: "3-judge intermediate appellate court" },
    ],
    supremeCourt: "Nevada Supreme Court",
    federalDistricts: [
      { name: "District of Nevada", abbreviation: "D. Nev." },
    ],
    filingPortalUrl: "https://nvcourts.gov",
  },
  // New Hampshire
  {
    stateSlug: "new-hampshire",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases over $1,500 with jury trials, felonies" },
      { name: "Circuit Court", description: "Three divisions: District (civil/criminal), Family (domestic), Probate" },
    ],
    appellateCourts: [],
    supremeCourt: "New Hampshire Supreme Court",
    federalDistricts: [
      { name: "District of New Hampshire", abbreviation: "D.N.H." },
    ],
    filingPortalUrl: "https://www.courts.state.nh.us",
  },
  // New Jersey
  {
    stateSlug: "new-jersey",
    trialCourts: [
      { name: "Superior Court, Law Division", description: "General civil and criminal matters over $15,000; jury trials" },
      { name: "Superior Court, Chancery Division", description: "Equity matters, family court, probate" },
      { name: "Superior Court, Family Division", description: "Domestic relations, juvenile, and family matters" },
      { name: "Tax Court", description: "Reviews local property tax assessments and state tax determinations" },
      { name: "Municipal Court", description: "Disorderly persons offenses, municipal ordinances, traffic violations" },
    ],
    appellateCourts: [
      { name: "Superior Court, Appellate Division", description: "Intermediate appellate court; reviews all trial court decisions" },
    ],
    supremeCourt: "Supreme Court of New Jersey",
    federalDistricts: [
      { name: "District of New Jersey", abbreviation: "D.N.J." },
    ],
    filingPortalUrl: "https://www.njcourts.gov",
  },
  // New Mexico
  {
    stateSlug: "new-mexico",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; 13 judicial districts; all civil, criminal, and domestic matters" },
      { name: "Magistrate Court", description: "Civil cases up to $10,000, misdemeanors, petty misdemeanors" },
      { name: "Municipal Court", description: "City ordinance violations and petty misdemeanors" },
      { name: "Bernalillo County Metropolitan Court", description: "Largest limited jurisdiction court; covers Albuquerque" },
    ],
    appellateCourts: [
      { name: "New Mexico Court of Appeals", description: "10-judge intermediate appellate court" },
    ],
    supremeCourt: "New Mexico Supreme Court",
    federalDistricts: [
      { name: "District of New Mexico", abbreviation: "D.N.M." },
    ],
    filingPortalUrl: "https://www.nmcourts.gov",
  },
  // New York
  {
    stateSlug: "new-york",
    trialCourts: [
      { name: "Supreme Court", description: "General jurisdiction trial court (confusingly named); handles major civil cases and felonies; one in each county" },
      { name: "County Court", description: "Outside NYC; handles felonies and civil cases up to $25,000" },
      { name: "Family Court", description: "Matters involving children and families; custody, support, neglect, juvenile delinquency" },
      { name: "Surrogate's Court", description: "Probate, estates, adoptions" },
      { name: "City Court", description: "Civil cases up to $15,000 in cities outside NYC" },
      { name: "Town and Village Justice Court", description: "Local matters; civil cases up to $3,000" },
      { name: "Court of Claims", description: "Claims against New York State" },
      { name: "Civil Court of the City of New York", description: "Civil cases up to $25,000 within NYC" },
      { name: "Criminal Court of the City of New York", description: "Misdemeanors and violations within NYC" },
    ],
    appellateCourts: [
      { name: "Appellate Division, First Department", description: "Covers Manhattan and the Bronx" },
      { name: "Appellate Division, Second Department", description: "Covers Brooklyn, Queens, Staten Island, and several downstate counties" },
      { name: "Appellate Division, Third Department", description: "Covers Capital Region and upstate" },
      { name: "Appellate Division, Fourth Department", description: "Covers western and central New York" },
      { name: "Appellate Term", description: "Reviews City Court, Civil Court, and Criminal Court decisions in NYC and Second Department area" },
    ],
    supremeCourt: "Court of Appeals",
    federalDistricts: [
      { name: "Southern District of New York", abbreviation: "S.D.N.Y." },
      { name: "Eastern District of New York", abbreviation: "E.D.N.Y." },
      { name: "Northern District of New York", abbreviation: "N.D.N.Y." },
      { name: "Western District of New York", abbreviation: "W.D.N.Y." },
    ],
    filingPortalUrl: "https://iapps.courts.state.ny.us/nyscef",
  },
  // North Carolina
  {
    stateSlug: "north-carolina",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases over $25,000, felonies" },
      { name: "District Court", description: "Civil cases up to $25,000, misdemeanors, domestic relations, juvenile" },
    ],
    appellateCourts: [
      { name: "North Carolina Court of Appeals", description: "15-judge intermediate appellate court" },
      { name: "North Carolina Business Court", description: "Specialized court for complex business cases" },
    ],
    supremeCourt: "Supreme Court of North Carolina",
    federalDistricts: [
      { name: "Eastern District of North Carolina", abbreviation: "E.D.N.C." },
      { name: "Middle District of North Carolina", abbreviation: "M.D.N.C." },
      { name: "Western District of North Carolina", abbreviation: "W.D.N.C." },
    ],
    filingPortalUrl: "https://www.nccourts.gov",
  },
  // North Dakota
  {
    stateSlug: "north-dakota",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; 7 judicial districts across 53 counties" },
      { name: "Municipal Court", description: "City ordinance violations and some misdemeanors" },
    ],
    appellateCourts: [],
    supremeCourt: "North Dakota Supreme Court",
    federalDistricts: [
      { name: "District of North Dakota", abbreviation: "D.N.D." },
    ],
    filingPortalUrl: "https://www.ndcourts.gov",
  },
  // Ohio
  {
    stateSlug: "ohio",
    trialCourts: [
      { name: "Court of Common Pleas", description: "General jurisdiction; civil cases over $500, felonies; four divisions: General, Domestic, Probate, Juvenile" },
      { name: "Municipal Court", description: "Civil cases up to $15,000, misdemeanors, traffic" },
      { name: "County Court", description: "In counties without municipal courts; civil cases up to $15,000" },
      { name: "Court of Claims", description: "Claims against the State of Ohio" },
    ],
    appellateCourts: [
      { name: "Ohio Courts of Appeals", description: "12 appellate districts covering all 88 counties" },
    ],
    supremeCourt: "Supreme Court of Ohio",
    federalDistricts: [
      { name: "Northern District of Ohio", abbreviation: "N.D. Ohio" },
      { name: "Southern District of Ohio", abbreviation: "S.D. Ohio" },
    ],
    filingPortalUrl: "https://www.ohiocourts.gov",
  },
  // Oklahoma
  {
    stateSlug: "oklahoma",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; 26 judicial districts; all civil and criminal matters" },
    ],
    appellateCourts: [
      { name: "Oklahoma Court of Civil Appeals", description: "Intermediate appellate court for civil matters" },
      { name: "Oklahoma Court of Criminal Appeals", description: "Court of last resort for criminal matters (concurrent with Supreme Court in some matters)" },
    ],
    supremeCourt: "Oklahoma Supreme Court",
    federalDistricts: [
      { name: "Northern District of Oklahoma", abbreviation: "N.D. Okla." },
      { name: "Eastern District of Oklahoma", abbreviation: "E.D. Okla." },
      { name: "Western District of Oklahoma", abbreviation: "W.D. Okla." },
    ],
    filingPortalUrl: "https://www.oscn.net",
  },
  // Oregon
  {
    stateSlug: "oregon",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; 27 judicial districts; civil, criminal, family, and probate matters" },
      { name: "Oregon Tax Court", description: "Statewide jurisdiction over property tax and other state tax disputes" },
    ],
    appellateCourts: [
      { name: "Oregon Court of Appeals", description: "13-judge intermediate appellate court" },
    ],
    supremeCourt: "Oregon Supreme Court",
    federalDistricts: [
      { name: "District of Oregon", abbreviation: "D. Or." },
    ],
    filingPortalUrl: "https://www.courts.oregon.gov",
  },
  // Pennsylvania
  {
    stateSlug: "pennsylvania",
    trialCourts: [
      { name: "Court of Common Pleas", description: "General jurisdiction; 60 judicial districts; civil, criminal, family, and orphans' court divisions" },
      { name: "Magisterial District Court", description: "Civil cases up to $12,000, summary offenses, traffic, landlord-tenant" },
      { name: "Philadelphia Municipal Court", description: "Civil cases up to $12,000 in Philadelphia; traffic and misdemeanors" },
      { name: "Pittsburgh Municipal Court", description: "Traffic and misdemeanor matters in Pittsburgh" },
    ],
    appellateCourts: [
      { name: "Superior Court of Pennsylvania", description: "Reviews criminal, civil, and family matters from courts of common pleas" },
      { name: "Commonwealth Court of Pennsylvania", description: "Reviews civil actions against the state and appeals from state agencies" },
    ],
    supremeCourt: "Supreme Court of Pennsylvania",
    federalDistricts: [
      { name: "Eastern District of Pennsylvania", abbreviation: "E.D. Pa." },
      { name: "Middle District of Pennsylvania", abbreviation: "M.D. Pa." },
      { name: "Western District of Pennsylvania", abbreviation: "W.D. Pa." },
    ],
    filingPortalUrl: "https://www.pacourts.us",
  },
  // Rhode Island
  {
    stateSlug: "rhode-island",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil cases over $10,000, felonies" },
      { name: "District Court", description: "Civil cases up to $10,000, misdemeanors, small claims, traffic" },
      { name: "Family Court", description: "All domestic relations and juvenile matters" },
      { name: "Probate Court", description: "Wills, estates, guardianships at the municipal level" },
      { name: "Workers' Compensation Court", description: "Workers' compensation disputes" },
    ],
    appellateCourts: [],
    supremeCourt: "Rhode Island Supreme Court",
    federalDistricts: [
      { name: "District of Rhode Island", abbreviation: "D.R.I." },
    ],
    filingPortalUrl: "https://www.courts.ri.gov",
  },
  // South Carolina
  {
    stateSlug: "south-carolina",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $7,500, felonies; two divisions: Common Pleas (civil) and General Sessions (criminal)" },
      { name: "Family Court", description: "All domestic relations, juvenile, and adoption matters" },
      { name: "Probate Court", description: "Wills, estates, guardianships, mental health commitments" },
      { name: "Magistrate Court", description: "Civil cases up to $7,500, misdemeanors, traffic" },
      { name: "Municipal Court", description: "City ordinance violations and traffic within municipal limits" },
    ],
    appellateCourts: [
      { name: "South Carolina Court of Appeals", description: "9-judge intermediate appellate court" },
    ],
    supremeCourt: "Supreme Court of South Carolina",
    federalDistricts: [
      { name: "District of South Carolina", abbreviation: "D.S.C." },
    ],
    filingPortalUrl: "https://www.sccourts.org",
  },
  // South Dakota
  {
    stateSlug: "south-dakota",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; 7 circuits across 66 counties; all civil, criminal, and domestic matters" },
      { name: "Magistrate Court", description: "Civil cases up to $10,000, misdemeanors, small claims" },
    ],
    appellateCourts: [],
    supremeCourt: "South Dakota Supreme Court",
    federalDistricts: [
      { name: "District of South Dakota", abbreviation: "D.S.D." },
    ],
    filingPortalUrl: "https://ujs.sd.gov",
  },
  // Tennessee
  {
    stateSlug: "tennessee",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases and criminal jury trials" },
      { name: "Chancery Court", description: "Equity jurisdiction; contracts, trusts, corporate matters" },
      { name: "Criminal Court", description: "Felony criminal cases in larger counties" },
      { name: "Juvenile Court", description: "Matters involving minors" },
      { name: "Probate Court", description: "Wills and estates in larger counties" },
      { name: "General Sessions Court", description: "Civil cases up to $25,000, misdemeanors, preliminary hearings" },
    ],
    appellateCourts: [
      { name: "Tennessee Court of Appeals", description: "12-judge intermediate court for civil matters" },
      { name: "Tennessee Court of Criminal Appeals", description: "12-judge intermediate court for criminal matters" },
    ],
    supremeCourt: "Tennessee Supreme Court",
    federalDistricts: [
      { name: "Eastern District of Tennessee", abbreviation: "E.D. Tenn." },
      { name: "Middle District of Tennessee", abbreviation: "M.D. Tenn." },
      { name: "Western District of Tennessee", abbreviation: "W.D. Tenn." },
    ],
    filingPortalUrl: "https://www.tncourts.gov",
  },
  // Texas
  {
    stateSlug: "texas",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; civil cases over $200, felonies, domestic relations" },
      { name: "County Court at Law", description: "Statutory courts; civil cases up to $200,000, misdemeanors" },
      { name: "Constitutional County Court", description: "All 254 counties; civil cases up to $10,000, Class A and B misdemeanors" },
      { name: "Justice Court", description: "Civil cases up to $20,000, Class C misdemeanors, small claims" },
      { name: "Municipal Court", description: "Class C misdemeanors and city ordinance violations" },
    ],
    appellateCourts: [
      { name: "Courts of Appeals", description: "14 intermediate appellate courts covering geographic regions" },
    ],
    supremeCourt: "Supreme Court of Texas",
    federalDistricts: [
      { name: "Northern District of Texas", abbreviation: "N.D. Tex." },
      { name: "Southern District of Texas", abbreviation: "S.D. Tex." },
      { name: "Eastern District of Texas", abbreviation: "E.D. Tex." },
      { name: "Western District of Texas", abbreviation: "W.D. Tex." },
    ],
    filingPortalUrl: "https://www.txcourts.gov",
  },
  // Utah
  {
    stateSlug: "utah",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; 8 judicial districts; all civil, criminal, domestic, and juvenile matters" },
      { name: "Justice Court", description: "Civil cases up to $11,000, infractions, Class B and C misdemeanors" },
    ],
    appellateCourts: [
      { name: "Utah Court of Appeals", description: "7-judge intermediate appellate court" },
    ],
    supremeCourt: "Utah Supreme Court",
    federalDistricts: [
      { name: "District of Utah", abbreviation: "D. Utah" },
    ],
    filingPortalUrl: "https://www.utcourts.gov",
  },
  // Vermont
  {
    stateSlug: "vermont",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; civil, criminal, family, and probate divisions in each county" },
      { name: "Environmental Division", description: "Land use, environmental law, and Act 250 permits" },
    ],
    appellateCourts: [],
    supremeCourt: "Vermont Supreme Court",
    federalDistricts: [
      { name: "District of Vermont", abbreviation: "D. Vt." },
    ],
    filingPortalUrl: "https://www.vermontjudiciary.org",
  },
  // Virginia
  {
    stateSlug: "virginia",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; civil cases over $25,000, felonies, domestic relations, equity" },
      { name: "General District Court", description: "Civil cases up to $25,000, misdemeanors, traffic, small claims" },
      { name: "Juvenile and Domestic Relations District Court", description: "All matters involving minors and domestic relations" },
    ],
    appellateCourts: [
      { name: "Court of Appeals of Virginia", description: "17-judge intermediate appellate court" },
    ],
    supremeCourt: "Supreme Court of Virginia",
    federalDistricts: [
      { name: "Eastern District of Virginia", abbreviation: "E.D. Va." },
      { name: "Western District of Virginia", abbreviation: "W.D. Va." },
    ],
    filingPortalUrl: "https://www.vacourts.gov",
  },
  // Washington
  {
    stateSlug: "washington",
    trialCourts: [
      { name: "Superior Court", description: "General jurisdiction; one in each of 39 counties; all civil, criminal, and domestic matters" },
      { name: "District Court", description: "Civil cases up to $100,000, misdemeanors, traffic, small claims" },
      { name: "Municipal Court", description: "City ordinance violations within municipal limits" },
    ],
    appellateCourts: [
      { name: "Court of Appeals, Division I", description: "Covers King, San Juan, Island, Skagit, Whatcom, and Snohomish counties" },
      { name: "Court of Appeals, Division II", description: "Covers Pierce, Mason, Thurston, and other southwest counties" },
      { name: "Court of Appeals, Division III", description: "Covers eastern Washington" },
    ],
    supremeCourt: "Washington Supreme Court",
    federalDistricts: [
      { name: "Western District of Washington", abbreviation: "W.D. Wash." },
      { name: "Eastern District of Washington", abbreviation: "E.D. Wash." },
    ],
    filingPortalUrl: "https://www.courts.wa.gov",
  },
  // West Virginia
  {
    stateSlug: "west-virginia",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; one in each of 55 counties; all civil and criminal matters" },
      { name: "Magistrate Court", description: "Civil cases up to $10,000, misdemeanors, small claims" },
      { name: "Family Court", description: "Domestic relations matters in each county" },
      { name: "Municipal Court", description: "Municipal ordinance violations" },
    ],
    appellateCourts: [
      { name: "Intermediate Court of Appeals", description: "Created in 2021; reviews circuit court civil decisions" },
    ],
    supremeCourt: "Supreme Court of Appeals of West Virginia",
    federalDistricts: [
      { name: "Northern District of West Virginia", abbreviation: "N.D.W. Va." },
      { name: "Southern District of West Virginia", abbreviation: "S.D.W. Va." },
    ],
    filingPortalUrl: "https://www.courtswv.gov",
  },
  // Wisconsin
  {
    stateSlug: "wisconsin",
    trialCourts: [
      { name: "Circuit Court", description: "General jurisdiction; one in each of 72 counties; all civil, criminal, family, and probate matters" },
    ],
    appellateCourts: [
      { name: "Wisconsin Court of Appeals", description: "4 districts; 16-judge intermediate appellate court" },
    ],
    supremeCourt: "Wisconsin Supreme Court",
    federalDistricts: [
      { name: "Eastern District of Wisconsin", abbreviation: "E.D. Wis." },
      { name: "Western District of Wisconsin", abbreviation: "W.D. Wis." },
    ],
    filingPortalUrl: "https://www.wicourts.gov",
  },
  // Wyoming
  {
    stateSlug: "wyoming",
    trialCourts: [
      { name: "District Court", description: "General jurisdiction; 9 judicial districts across 23 counties" },
      { name: "Circuit Court", description: "Civil cases up to $50,000, misdemeanors, small claims, traffic" },
      { name: "Municipal Court", description: "Violations of city ordinances" },
    ],
    appellateCourts: [],
    supremeCourt: "Wyoming Supreme Court",
    federalDistricts: [
      { name: "District of Wyoming", abbreviation: "D. Wyo." },
    ],
    filingPortalUrl: "https://www.courts.state.wy.us",
  },
  // U.S. territories (added 2026-06-27)
  {
    stateSlug: "puerto-rico",
    trialCourts: [
      { name: "Court of First Instance (Tribunal de Primera Instancia)", description: "General jurisdiction trial court of the Commonwealth, organized into Superior and Municipal divisions; hears civil and criminal matters" },
    ],
    appellateCourts: [
      { name: "Puerto Rico Court of Appeals (Tribunal de Apelaciones)", description: "Intermediate appellate court reviewing decisions of the Court of First Instance" },
    ],
    supremeCourt: "Supreme Court of Puerto Rico (Tribunal Supremo de Puerto Rico)",
    federalDistricts: [
      { name: "District of Puerto Rico", abbreviation: "D.P.R." },
    ],
  },
  {
    stateSlug: "us-virgin-islands",
    trialCourts: [
      { name: "Superior Court of the Virgin Islands", description: "General jurisdiction trial court for local civil and criminal matters" },
    ],
    appellateCourts: [],
    supremeCourt: "Supreme Court of the Virgin Islands",
    federalDistricts: [
      { name: "District Court of the Virgin Islands", abbreviation: "D.V.I." },
    ],
  },
  {
    stateSlug: "guam",
    trialCourts: [
      { name: "Superior Court of Guam", description: "General jurisdiction trial court for local civil and criminal matters" },
    ],
    appellateCourts: [],
    supremeCourt: "Supreme Court of Guam",
    federalDistricts: [
      { name: "District Court of Guam", abbreviation: "D. Guam" },
    ],
  },
  {
    stateSlug: "american-samoa",
    trialCourts: [
      { name: "High Court of American Samoa (Trial Division)", description: "Principal general jurisdiction trial court for local civil and criminal matters" },
      { name: "District Court of American Samoa", description: "Lower local court handling minor civil and criminal matters" },
    ],
    appellateCourts: [
      { name: "High Court of American Samoa (Appellate Division)", description: "Highest local court; reviews decisions of the High Court trial divisions" },
    ],
    supremeCourt: "High Court of American Samoa, Appellate Division (American Samoa has no separate supreme court)",
    federalDistricts: [
      { name: "No local U.S. district court - the High Court has limited federal jurisdiction; other federal matters are generally heard in the U.S. District Courts for the District of Hawaii or the District of Columbia", abbreviation: "none" },
    ],
  },
  {
    stateSlug: "northern-mariana-islands",
    trialCourts: [
      { name: "Superior Court of the Commonwealth of the Northern Mariana Islands", description: "General jurisdiction trial court for local civil and criminal matters" },
    ],
    appellateCourts: [],
    supremeCourt: "Supreme Court of the Commonwealth of the Northern Mariana Islands",
    federalDistricts: [
      { name: "District Court for the Northern Mariana Islands", abbreviation: "D.N. Mar. I." },
    ],
  },
];

export function getCourtsByState(stateSlug: string): StateCourtSystem | undefined {
  return stateCourts.find((c) => c.stateSlug === stateSlug);
}
