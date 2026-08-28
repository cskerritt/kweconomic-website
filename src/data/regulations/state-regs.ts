import type { StateRegulation } from "../../types";

/**
 * Citation-free per-state damages framing for economic loss analyses.
 * `compensationForum` is the public body that administers workers'
 * compensation (the forum, outside civil court, where a wage-loss dispute is
 * most often decided). `damagesContext` is one to three general sentences on
 * the parts of the state's damages framework an economist's report has to be
 * built around: how wrongful death and survival recoveries are measured, how
 * collateral-source payments are treated, and whether prejudgment interest
 * exists. Primary-source citations, rule numbers, rates, and cap amounts are
 * intentionally omitted; attorneys are responsible for confirming the
 * governing framework for their case.
 */
export const stateRegulations: StateRegulation[] = [
  {
    stateSlug: "alabama",
    compensationForum: "Alabama Department of Labor, Workers' Compensation Division",
    damagesContext: "Alabama measures wrongful death differently from most states: the recovery is punitive in character rather than a computation of the survivors' pecuniary loss, so the economist's projection of the decedent's earnings plays a narrower role than in a personal injury claim, where lost earnings and household services are measured in the usual way. Alabama retains contributory negligence, evidence that medical expenses were paid by insurance or other sources is admissible, a departure from the strict collateral source rule, and prejudgment interest is generally not awarded on unliquidated tort damages.",
  },
  {
    stateSlug: "alaska",
    compensationForum: "Alaska Workers' Compensation Board",
    damagesContext: "Alaska pairs a wrongful death action, measured by the loss to the surviving spouse, children, or dependents, with a survival action for the decedent's own claims, and when no dependents survive the recovery runs to the estate on a different measure. Collateral-source payments reduce the award after verdict except where the source holds a subrogation right, and prejudgment interest runs on tort awards from a defined accrual point, so the interval between injury and judgment is part of the economic picture.",
  },
  {
    stateSlug: "arizona",
    compensationForum: "Industrial Commission of Arizona",
    damagesContext: "Arizona's wrongful death action belongs to the surviving spouse, children, parents, or estate and is measured by their own losses, while the decedent's pre-death claims survive to the estate without damages for the decedent's pain and suffering. The state constitution bars legislative limits on the amount recovered for death or injury, pure comparative fault reduces the award in proportion, evidence of collateral-source payments is admissible in medical malpractice cases but not in ordinary injury claims, and prejudgment interest is generally limited to liquidated sums.",
  },
  {
    stateSlug: "arkansas",
    compensationForum: "Arkansas Workers' Compensation Commission",
    damagesContext: "Arkansas allows a wrongful death action for the statutory beneficiaries' pecuniary loss and mental anguish alongside a survival action for the estate, and the state constitution bars limits on the amount recoverable for injury or death. Recovery is barred only when the plaintiff's fault equals or exceeds the defendants', the common-law collateral source rule applies, and prejudgment interest is available where the amount of the loss was determinable at the time of the injury.",
  },
  {
    stateSlug: "california",
    compensationForum: "California Division of Workers' Compensation",
    damagesContext: "California pairs a wrongful death action for the heirs' economic and companionship losses with a survival action for the estate's own claims, and past medical expenses are measured by the amounts actually paid or owed rather than by the amounts billed. Pure comparative fault reduces the award in proportion, the collateral source rule applies outside medical malpractice, and prejudgment interest in injury cases turns on the statutory offer-to-compromise procedure rather than accruing as of right.",
  },
  {
    stateSlug: "colorado",
    compensationForum: "Colorado Division of Workers' Compensation",
    damagesContext: "Colorado's wrongful death action is measured by the net pecuniary loss to the heirs plus a limited allowance for grief, while the survival action for the estate excludes the decedent's pain and suffering. Awards are reduced after verdict by collateral-source payments other than benefits the plaintiff paid for by contract, recovery is barred once the plaintiff's fault reaches half, and prejudgment interest on personal injury awards runs from the date the claim accrued.",
  },
  {
    stateSlug: "connecticut",
    compensationForum: "Connecticut Workers' Compensation Commission",
    damagesContext: "Connecticut measures wrongful death from the decedent's standpoint: the estate recovers for the destruction of the capacity to carry on life's activities and for lost earning power net of the decedent's own living expenses, so the economist's net earnings projection is central. Awards are reduced after verdict by collateral-source payments unless the source holds a right of reimbursement, recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, and interest can attach to a verdict that beats a rejected offer of compromise.",
  },
  {
    stateSlug: "delaware",
    compensationForum: "Delaware Office of Workers' Compensation",
    damagesContext: "Delaware provides a wrongful death action for the beneficiaries' pecuniary losses and mental anguish alongside a survival action for the estate, and recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants. The collateral source rule applies outside medical malpractice, where evidence of collateral payments is admissible, and prejudgment interest is available in personal injury actions when the plaintiff made a timely written settlement demand.",
  },
  {
    stateSlug: "district-of-columbia",
    compensationForum: "DC Department of Employment Services, Office of Workers' Compensation",
    damagesContext: "The District pairs a wrongful death action for the pecuniary loss to the spouse and next of kin with a survival action in which the estate recovers the decedent's probable future earnings net of personal maintenance, and the two recoveries are coordinated to prevent double counting. Contributory negligence remains a complete bar in most cases, the common-law collateral source rule applies, and prejudgment interest on unliquidated damages is discretionary.",
  },
  {
    stateSlug: "florida",
    compensationForum: "Florida Division of Workers' Compensation",
    damagesContext: "Florida's Wrongful Death Act gives each survivor a claim for lost support and services and gives the estate a claim for the decedent's lost net accumulations, an expressly economic concept that the economist projects from the decedent's earnings, consumption, and savings pattern. Awards are reduced by collateral-source payments unless the source holds a subrogation right, recovery is barred in most negligence actions once the plaintiff is found more at fault than the defendants, and prejudgment interest is generally not awarded on personal injury or wrongful death damages.",
  },
  {
    stateSlug: "georgia",
    compensationForum: "Georgia State Board of Workers' Compensation",
    damagesContext: "Georgia measures wrongful death by the full value of the life of the decedent from the decedent's own standpoint, an economic component built on lost earnings and services without deduction for the decedent's personal expenses plus an intangible component, while the estate separately recovers pre-death medical expenses, pain and suffering, and funeral costs. Recovery is barred once the plaintiff's fault reaches half, the common-law collateral source rule applies, and prejudgment interest on unliquidated tort damages is tied to a written demand procedure.",
  },
  {
    stateSlug: "hawaii",
    compensationForum: "Hawaii Disability Compensation Division",
    damagesContext: "Hawaii's wrongful death statute lets the surviving spouse, children, parents, and dependents recover their own losses of support, services, and companionship and lets the estate recover the decedent's lost future earnings net of personal consumption, so the economist prepares both a survivor-support projection and a net-earnings projection. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the courts apply the collateral source rule with limited statutory exceptions, and prejudgment interest is discretionary.",
  },
  {
    stateSlug: "idaho",
    compensationForum: "Idaho Industrial Commission",
    damagesContext: "Idaho pairs a wrongful death action for the heirs' losses with a survival action in which the estate recovers the decedent's pre-death economic losses but not pain and suffering. Awards are reduced after verdict by collateral-source payments other than those with a right of subrogation and certain federal and life insurance benefits, recovery is barred once the plaintiff's fault equals or exceeds the defendants', and prejudgment interest is generally limited to liquidated sums.",
  },
  {
    stateSlug: "illinois",
    compensationForum: "Illinois Workers' Compensation Commission",
    damagesContext: "Illinois pairs a wrongful death action for the pecuniary injuries to the spouse and next of kin, which now include grief and loss of society, with a survival action for the decedent's own claims, including earnings lost between injury and death. Recovery is barred once the plaintiff's fault exceeds half, the common-law collateral source rule applies with a post-verdict reduction procedure in medical malpractice cases, and prejudgment interest on personal injury and wrongful death awards now runs from the filing of the action.",
  },
  {
    stateSlug: "indiana",
    compensationForum: "Worker's Compensation Board of Indiana",
    damagesContext: "Indiana's wrongful death remedies differ by who died: the general act measures the loss to a spouse or dependents, a separate act covers adults without dependents with limited nonpecuniary recovery, and a child act covers minors, so the economist's role depends on which act applies. Recovery is barred once the plaintiff's fault exceeds half, the jury may hear evidence of collateral-source payments other than insurance the plaintiff or family paid for and governmental benefits, and prejudgment interest in tort turns on a statutory settlement-offer procedure.",
  },
  {
    stateSlug: "iowa",
    compensationForum: "Iowa Division of Workers' Compensation",
    damagesContext: "Iowa's wrongful death recovery belongs to the estate and is measured by the present value of what the decedent would have accumulated over a normal lifetime net of personal expenses, with the spouse's and children's loss of consortium recovered separately, which makes the economist's net-accumulation projection central. In a personal injury action the jury hears evidence and argument on prior payments and future rights of payment for the cost of necessary medical care, rehabilitation services, and custodial care, other than payments under a state or federal program or from the assets of the plaintiff or the plaintiff's immediate family, together with what the plaintiff paid to secure those payments and any subrogation or indemnification rights attached to them, and then answers special interrogatories on how that evidence affected the verdict. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, and interest on a judgment runs from the filing of the petition on past losses but only from judgment on future damages.",
  },
  {
    stateSlug: "kansas",
    compensationForum: "Kansas Division of Workers Compensation",
    damagesContext: "Kansas provides a wrongful death action for the heirs' pecuniary and nonpecuniary losses, with the nonpecuniary component subject to a statutory limit, alongside a survival action for the estate. Recovery is barred once the plaintiff's fault reaches half, the common-law collateral source rule applies after the courts set aside a statutory offset, and prejudgment interest is generally limited to liquidated sums.",
  },
  {
    stateSlug: "kentucky",
    compensationForum: "Kentucky Department of Workers' Claims",
    damagesContext: "Kentucky measures wrongful death by the destruction of the decedent's power to earn money, a recovery that belongs to the estate and turns directly on the economist's projection of the decedent's earnings, with consortium claims brought separately by the spouse and minor children. Pure comparative fault reduces the award in proportion, the common-law collateral source rule applies after the courts set aside a statute admitting collateral payments, and prejudgment interest on unliquidated damages is discretionary.",
  },
  {
    stateSlug: "louisiana",
    compensationForum: "Louisiana Office of Workers' Compensation Administration",
    damagesContext: "Louisiana's civil code provides a survival action for the decedent's own damages and a separate wrongful death action for the designated beneficiaries' losses, both measured under a pure comparative fault system. The collateral source rule applies with exceptions the courts have carved out for amounts written off by providers, and judicial interest runs on tort awards from the date of judicial demand.",
  },
  {
    stateSlug: "maine",
    compensationForum: "Maine Workers' Compensation Board",
    damagesContext: "Maine's wrongful death action is brought by the personal representative for the beneficiaries' pecuniary injuries, with separate and limited allowances for loss of comfort, society, and companionship, alongside a survival action for the estate. Recovery is barred once the plaintiff's fault equals or exceeds the defendants', the common-law collateral source rule applies, and prejudgment interest runs from the filing of the notice of claim or complaint.",
  },
  {
    stateSlug: "maryland",
    compensationForum: "Maryland Workers' Compensation Commission",
    damagesContext: "Maryland pairs a wrongful death action for the beneficiaries' pecuniary loss and solatium with a survival action for the estate, and a statutory limit applies to the noneconomic portion of most awards while economic damages are unlimited. Contributory negligence remains a complete bar, the common-law collateral source rule applies, and prejudgment interest on unliquidated tort damages is generally not available.",
  },
  {
    stateSlug: "massachusetts",
    compensationForum: "Massachusetts Department of Industrial Accidents",
    damagesContext: "Massachusetts measures wrongful death by the fair monetary value of the decedent to the beneficiaries, including lost income, services, protection, care, assistance, society, and companionship, and permits punitive damages for gross negligence, with the decedent's own conscious suffering recovered by the estate. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the common-law collateral source rule applies outside medical malpractice, and prejudgment interest on tort awards runs from the commencement of the action.",
  },
  {
    stateSlug: "michigan",
    compensationForum: "Michigan Workers' Disability Compensation Agency",
    damagesContext: "Michigan's wrongful death act gathers the survival and death claims into a single action: the estate recovers the decedent's conscious pain and suffering and medical and funeral expenses, and the surviving family recovers lost financial support, services, society, and companionship. Awards are reduced after verdict by collateral-source payments other than those subject to a lien, a plaintiff whose fault exceeds half loses noneconomic damages while economic damages are only reduced, the court reduces future damages to present value under a statutory formula, and interest on the judgment runs from the filing of the complaint.",
  },
  {
    stateSlug: "minnesota",
    compensationForum: "Minnesota Department of Labor and Industry, Workers' Compensation Division",
    damagesContext: "Minnesota's wrongful death action is brought by a trustee for the pecuniary loss to the surviving spouse and next of kin, a measure the courts read to include the value of the decedent's counsel, guidance, and aid, and a personal injury claim survives to the estate only when the death was caused by something other than the injury. Recovery is barred once the plaintiff's fault exceeds the defendant's, awards are reduced after verdict by collateral-source payments except where a subrogation right exists and offset by the premiums the plaintiff paid for them, and preverdict interest runs from the commencement of the action or a written settlement demand.",
  },
  {
    stateSlug: "mississippi",
    compensationForum: "Mississippi Workers' Compensation Commission",
    damagesContext: "Mississippi's wrongful death statute gathers every claim arising from a death into one action: the present net cash value of the decedent's life expectancy, the decedent's pain and suffering, medical and funeral expenses, and the survivors' loss of society and companionship. Pure comparative fault reduces the award in proportion, the common-law collateral source rule applies, a statutory limit applies to noneconomic damages while economic damages are unlimited, and prejudgment interest on unliquidated tort damages is generally not awarded.",
  },
  {
    stateSlug: "missouri",
    compensationForum: "Missouri Division of Workers' Compensation",
    damagesContext: "Missouri pairs a wrongful death action for the survivors' pecuniary losses, services, companionship, and the decedent's pre-death suffering with a survival action where death resulted from another cause, and the value of medical treatment is proved by the amounts actually paid or still owed rather than the amounts billed. Pure comparative fault reduces the award in proportion, the common-law collateral source rule otherwise applies, and prejudgment interest in tort turns on a written settlement offer that the judgment then exceeds.",
  },
  {
    stateSlug: "montana",
    compensationForum: "Montana Department of Labor and Industry, Employment Relations Division",
    damagesContext: "Montana pairs a wrongful death action for the heirs' losses with a survival action in which the estate may recover the decedent's lost future earnings net of personal consumption, with the two claims coordinated to avoid double recovery. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, larger awards are reduced after verdict by collateral-source payments that carry no reimbursement right, and prejudgment interest is generally limited to sums that were certain when the loss occurred.",
  },
  {
    stateSlug: "nebraska",
    compensationForum: "Nebraska Workers' Compensation Court",
    damagesContext: "Nebraska's wrongful death action is brought by the personal representative for the next of kin's pecuniary loss, which the courts read to include the value of the decedent's society, comfort, and companionship, alongside a survival action for the estate. Recovery is barred once the plaintiff's fault equals or exceeds the combined fault of the defendants, the common-law collateral source rule applies, and prejudgment interest is available on liquidated claims through a statutory offer procedure.",
  },
  {
    stateSlug: "nevada",
    compensationForum: "Nevada Division of Industrial Relations",
    damagesContext: "Nevada's wrongful death statute gives each heir a claim for grief, loss of support, companionship, and consortium and gives the estate a claim for the decedent's special damages and any punitive award, while a separate statutory limit applies to noneconomic damages in professional negligence cases. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the collateral source rule applies outside medical malpractice, and prejudgment interest runs on past damages from service of the complaint but is not allowed on future damages.",
  },
  {
    stateSlug: "new-hampshire",
    compensationForum: "New Hampshire Department of Labor, Workers' Compensation Division",
    damagesContext: "New Hampshire treats a death claim as the decedent's own action carried on by the estate: recovery includes the decedent's pain and suffering, medical and funeral expenses, and the probable duration of life and the capacity to earn money lost by the death, with limited separate allowances for a surviving spouse's and children's loss of comfort and society. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the common-law collateral source rule applies, and interest on the award runs from the filing of the writ.",
  },
  {
    stateSlug: "new-jersey",
    compensationForum: "New Jersey Division of Workers' Compensation",
    damagesContext: "New Jersey pairs a wrongful death action for the survivors' pecuniary loss, which the courts read to include the value of lost household services, advice, and guidance, with a survival action for the decedent's pain and suffering and the earnings lost before death. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, most collateral-source benefits other than workers' compensation and life insurance are deducted from the award after verdict, and prejudgment interest on tort awards is provided by court rule, running from a fixed point after the complaint.",
  },
  {
    stateSlug: "new-mexico",
    compensationForum: "New Mexico Workers' Compensation Administration",
    damagesContext: "New Mexico measures wrongful death by the worth of the decedent's life from the decedent's own standpoint, a recovery that belongs to the estate and includes lost earnings, the value of the decedent's life apart from earnings, and the decedent's own pre-death damages, with loss of consortium brought separately by close family. Pure comparative fault reduces the award in proportion, the common-law collateral source rule applies, and prejudgment interest is discretionary and weighs each party's settlement conduct.",
  },
  {
    stateSlug: "new-york",
    compensationForum: "New York State Workers' Compensation Board",
    damagesContext: "New York's wrongful death recovery has long been measured by the pecuniary injuries to the distributees, which puts lost earnings, lost household services, and the value of parental guidance at the center of the case, while the decedent's conscious pain and suffering is recovered in a survival claim by the estate. Pure comparative fault reduces the award in proportion, awards are reduced after trial by collateral-source payments that replace a cost or expense the jury awarded, larger future damage awards are converted to structured payments by the court, and prejudgment interest in a wrongful death action runs from the date of death.",
  },
  {
    stateSlug: "north-carolina",
    compensationForum: "North Carolina Industrial Commission",
    damagesContext: "North Carolina's wrongful death recovery covers the decedent's pre-death medical expenses and pain and suffering together with the present monetary value of the decedent to the beneficiaries, measured by net income, services, protection, care, society, and companionship, in a single action. Contributory negligence remains a complete bar, medical expenses are proved by the amounts actually paid or required to satisfy the bills rather than the amounts billed, and prejudgment interest on compensatory damages runs from the date the action was commenced.",
  },
  {
    stateSlug: "north-dakota",
    compensationForum: "North Dakota Workforce Safety and Insurance",
    damagesContext: "North Dakota pairs a wrongful death action for the damages to the surviving spouse, children, or parents with a survival action for the estate, and a statutory limit applies to noneconomic damages in health care malpractice claims while economic damages are unlimited. Recovery is barred once the plaintiff's fault equals or exceeds the combined fault of the defendants, economic damages are reduced after verdict by collateral-source payments other than those the plaintiff purchased or that carry a subrogation right, and prejudgment interest is generally limited to sums that were certain when the loss occurred.",
  },
  {
    stateSlug: "ohio",
    compensationForum: "Ohio Bureau of Workers' Compensation",
    damagesContext: "Ohio's wrongful death action is brought for the surviving spouse, children, parents, and next of kin and covers lost support from the decedent's expected earnings, lost services, society, prospective inheritance, and mental anguish, alongside a survival action for the decedent's own claims. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the defendant may introduce evidence of collateral-source payments that carry no right of reimbursement, statutory limits apply to noneconomic damages in most tort claims while economic damages are unlimited, and prejudgment interest turns on a finding that the losing party failed to make a good-faith effort to settle.",
  },
  {
    stateSlug: "oklahoma",
    compensationForum: "Oklahoma Workers' Compensation Commission",
    damagesContext: "Oklahoma's wrongful death action gathers the survivors' loss of support and companionship, grief, the decedent's pain and suffering, and medical and funeral expenses into a single recovery, and the courts have struck down a general legislative limit on noneconomic damages. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, evidence of medical expenses is limited to the amounts actually paid or owed, and prejudgment interest on a personal injury award begins to run only after a defined period following the filing of the suit.",
  },
  {
    stateSlug: "oregon",
    compensationForum: "Oregon Workers' Compensation Division",
    damagesContext: "Oregon's wrongful death statute gathers the estate's and the beneficiaries' claims into one action brought by the personal representative: the decedent's pre-death losses and suffering, medical and funeral expenses, the beneficiaries' pecuniary loss, and their loss of society and companionship. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the court may reduce an award after verdict by collateral-source payments other than insurance the plaintiff purchased, federal benefits, and sources with a reimbursement right, and prejudgment interest is generally not available on unliquidated injury damages.",
  },
  {
    stateSlug: "pennsylvania",
    compensationForum: "Pennsylvania Bureau of Workers' Compensation",
    damagesContext: "Pennsylvania keeps the wrongful death and survival actions distinct: the wrongful death claim covers the beneficiaries' lost support, services, and funeral and administration expenses, while the survival claim covers the decedent's pain and suffering and lost earnings for the rest of the projected worklife net of the decedent's personal maintenance, so the economist prepares both a support projection and a net-earnings projection. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the common-law collateral source rule applies outside medical malpractice, where past medical expenses and lost earnings already paid by certain benefits are not recoverable, and the civil rules add delay damages to bodily injury and death awards.",
  },
  {
    stateSlug: "rhode-island",
    compensationForum: "Rhode Island Workers' Compensation Court",
    damagesContext: "Rhode Island measures wrongful death by the pecuniary loss to the beneficiaries, computed from the decedent's projected earnings net of personal living expenses and reduced to present value under a method the courts have set out, together with the decedent's own pre-death claims and the survivors' loss of society and companionship, and the statute sets a minimum recovery. Pure comparative fault reduces the award in proportion, the common-law collateral source rule applies, and prejudgment interest on tort awards runs from the date of injury, which makes the interval between injury and judgment part of the economic picture.",
  },
  {
    stateSlug: "south-carolina",
    compensationForum: "South Carolina Workers' Compensation Commission",
    damagesContext: "South Carolina pairs a wrongful death action for the beneficiaries' pecuniary loss, mental shock, wounded feelings, and loss of companionship with a survival action for the decedent's pre-death losses and suffering, both brought by the personal representative. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the common-law collateral source rule applies, statutory limits apply to noneconomic damages in medical malpractice claims while economic damages are unlimited, and prejudgment interest is generally limited to liquidated sums.",
  },
  {
    stateSlug: "south-dakota",
    compensationForum: "South Dakota Department of Labor and Regulation, Division of Labor and Management",
    damagesContext: "South Dakota provides a wrongful death action for the pecuniary injury to the surviving spouse, children, or next of kin, which the courts read to include loss of companionship and society, alongside a survival action for the estate. The state's unusual comparative negligence rule allows recovery only when the plaintiff's negligence was slight in comparison with the defendant's, the common-law collateral source rule applies, and prejudgment interest is allowed on past damages but not on future damages, punitive damages, or intangible losses.",
  },
  {
    stateSlug: "tennessee",
    compensationForum: "Tennessee Bureau of Workers' Compensation",
    damagesContext: "Tennessee gathers the death claim into a single action that carries forward the decedent's own cause of action: recovery includes the decedent's pre-death losses and suffering, medical and funeral expenses, the pecuniary value of the decedent's life measured from earnings and life expectancy net of personal expenses, and the survivors' loss of consortium. Recovery is barred once the plaintiff's fault reaches half, the collateral source rule applies outside health care liability claims, statutory limits apply to noneconomic damages in most cases while economic damages are unlimited, and prejudgment interest is discretionary.",
  },
  {
    stateSlug: "texas",
    compensationForum: "Texas Department of Insurance, Division of Workers' Compensation",
    damagesContext: "Texas pairs a wrongful death action for the surviving spouse, children, and parents with a survival action for the estate's own claims, and the recovery of medical expenses is limited to the amounts actually paid or incurred rather than the amounts billed. Recovery is barred once the plaintiff's responsibility exceeds half, statutory limits apply to noneconomic damages in health care liability claims while economic damages are unlimited, and prejudgment interest accrues on past damages from a defined point after the defendant receives notice of the claim but is not awarded on future damages.",
  },
  {
    stateSlug: "utah",
    compensationForum: "Utah Labor Commission",
    damagesContext: "Utah pairs a wrongful death action for the heirs' losses with a survival action for the decedent's own pre-death claims, and the state constitution bars any statutory limit on the amount recoverable for wrongful death. Recovery is barred once the plaintiff's fault reaches half, the common-law collateral source rule applies outside health care malpractice claims where collateral payments reduce the award, and prejudgment interest is available on the special damages actually incurred before judgment in personal injury cases.",
  },
  {
    stateSlug: "vermont",
    compensationForum: "Vermont Department of Labor, Workers' Compensation Division",
    damagesContext: "Vermont provides a wrongful death action, brought by the personal representative for the pecuniary injuries to the spouse and next of kin, which the courts read to include the loss of the decedent's companionship and care, alongside a survival action for the decedent's own claims. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the common-law collateral source rule applies, and prejudgment interest is generally awarded only on liquidated sums or in the court's discretion.",
  },
  {
    stateSlug: "virginia",
    compensationForum: "Virginia Workers' Compensation Commission",
    damagesContext: "Virginia treats a death caused by the injury as a wrongful death action for the statutory beneficiaries, whose recovery includes sorrow and solace, the decedent's expected income, services, protection, care, and assistance, and medical and funeral expenses, with a separate survival action only when death came from another cause. Contributory negligence remains a complete bar, the common-law collateral source rule applies, a statutory limit applies to the total recovery in medical malpractice cases, and prejudgment interest is awarded at the discretion of the factfinder.",
  },
  {
    stateSlug: "washington",
    compensationForum: "Washington Department of Labor and Industries",
    damagesContext: "Washington pairs a wrongful death action for the beneficiaries' pecuniary loss, which was broadened in recent years to reach more family members, with a general survival action in which the estate recovers the decedent's economic losses, including net future earnings, and a limited survival claim for the decedent's own pre-death suffering. Pure comparative fault reduces the award in proportion, the collateral source rule applies outside medical malpractice where evidence of collateral payments is admissible, statutory limits on noneconomic damages have been held unconstitutional, and prejudgment interest is generally limited to liquidated sums.",
  },
  {
    stateSlug: "west-virginia",
    compensationForum: "West Virginia Offices of the Insurance Commissioner",
    damagesContext: "West Virginia's wrongful death action is brought by the personal representative and covers the survivors' sorrow and mental anguish, the decedent's expected income and services, and medical and funeral expenses, with the decedent's own pre-death claims carried in the same recovery. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, statutory limits apply to noneconomic damages in medical professional liability claims where collateral-source payments also reduce the award, and prejudgment interest is available on past special damages such as medical expenses and lost wages.",
  },
  {
    stateSlug: "wisconsin",
    compensationForum: "Wisconsin Department of Workforce Development, Worker's Compensation Division",
    damagesContext: "Wisconsin pairs a wrongful death action for the beneficiaries' pecuniary injury and a limited allowance for loss of society and companionship with a survival action for the decedent's own claims. Recovery is barred once the plaintiff's fault exceeds the defendant's, the common-law collateral source rule applies outside medical malpractice where evidence of collateral payments is admissible, statutory limits apply to noneconomic damages in medical malpractice claims, and interest on a verdict that beats a rejected statutory offer of settlement runs from the date of the offer.",
  },
  {
    stateSlug: "wyoming",
    compensationForum: "Wyoming Department of Workforce Services, Workers' Compensation Division",
    damagesContext: "Wyoming's wrongful death action is brought by a representative for the beneficiaries' losses, including pecuniary loss and loss of care, comfort, and society, alongside a survival action for the estate, and the state constitution bars any legislative limit on damages for injury or death. Recovery is barred once the plaintiff's fault exceeds the combined fault of the defendants, the common-law collateral source rule applies, and prejudgment interest is generally limited to liquidated sums.",
  },
  {
    stateSlug: "puerto-rico",
    compensationForum: "Puerto Rico State Insurance Fund Corporation (CFSE)",
    damagesContext: "Puerto Rico's civil-law tort system gives each surviving relative a claim of their own for the death of a family member, covering their own economic loss and suffering, alongside the estate's inherited claim for the decedent's pre-death damages. Comparative fault reduces recovery in proportion, private-party damages are not subject to a general statutory limit, and interest can be imposed on the award when a party is found to have litigated with obstinacy.",
  },
  {
    stateSlug: "us-virgin-islands",
    compensationForum: "Virgin Islands Department of Labor, Workers' Compensation Division",
    damagesContext: "The Virgin Islands wrongful death statute follows the Florida model: each survivor recovers lost support and services and, for a spouse and minor children, loss of companionship and mental pain, and the estate recovers the decedent's lost net accumulations, an economic projection built from earnings, consumption, and savings. Comparative fault reduces recovery in proportion, and the treatment of collateral-source payments and prejudgment interest follows the territory's own statutes and case law, which counsel should confirm for the specific claim.",
  },
  {
    stateSlug: "guam",
    compensationForum: "Guam Department of Labor, Workers' Compensation Commission",
    damagesContext: "Guam's wrongful death action, patterned on California's, is brought for the heirs' losses, and the decedent's own pre-death claims survive to the estate; claims against the government proceed under a separate claims act with its own procedures. Comparative fault reduces recovery in proportion, and the treatment of collateral-source payments and prejudgment interest follows Guam's own statutes and case law, which counsel should confirm for the specific claim.",
  },
  {
    stateSlug: "american-samoa",
    compensationForum: "American Samoa Workmen's Compensation Commission",
    damagesContext: "In American Samoa, a wrongful death action for the beneficiaries' pecuniary loss and a survival action for the decedent's own claims are heard by the Trial Division of the High Court, and the small on-island wage market means an earnings history often includes government, cannery, or off-island employment. The rules on fault allocation, collateral-source payments, and prejudgment interest follow the territory's own code and case law, which counsel should confirm for the specific claim.",
  },
  {
    stateSlug: "northern-mariana-islands",
    compensationForum: "CNMI Workers' Compensation Commission",
    damagesContext: "In the Northern Mariana Islands, a wrongful death action for the beneficiaries' loss and a survival action for the decedent's own claims are heard in the Commonwealth Superior Court, and earnings histories often combine Commonwealth government employment, tourism and service work, and periods on Guam or the mainland. The rules on fault allocation, collateral-source payments, and prejudgment interest follow the Commonwealth's own code and case law, which counsel should confirm for the specific claim.",
  },
];

export function getRegulationsByState(stateSlug: string): StateRegulation | undefined {
  return stateRegulations.find((r) => r.stateSlug === stateSlug);
}
