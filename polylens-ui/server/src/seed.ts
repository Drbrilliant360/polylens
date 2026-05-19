import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'admin@polylens.ai' },
    update: {},
    create: {
      email: 'admin@polylens.ai',
      name: 'Admin User',
      password,
      role: 'admin',
    },
  })

  const existing = await prisma.assessment.findFirst({ where: { userId: user.id } })
  if (existing) {
    console.log('Seed data already exists, skipping.')
    return
  }

  const assessment = await prisma.assessment.create({
    data: {
      title: 'National AI Strategy 2025-2030',
      country: 'Tanzania',
      documentName: 'Tanzania National ICT Policy 2023',
      overallScore: 42,
      readinessLevel: 'Developing',
      userId: user.id,
      dimensions: {
        create: [
          { name: 'AI Policy & Strategy', score: 55, level: 'Emerging', keyFinding: 'Formal AI strategy exists but lacks actionable implementation plans and dedicated funding mechanisms.' },
          { name: 'Strategy Alignment', score: 48, level: 'Developing', keyFinding: 'Partial alignment with SDGs and AU Digital Transformation Strategy; weak linkage to national development plan.' },
          { name: 'Data & Model Ecosystem', score: 32, level: 'Developing', keyFinding: 'Data protection law exists but no open data policy or AI model marketplace framework.' },
          { name: 'Cross-Domain Correlation', score: 38, level: 'Developing', keyFinding: 'AI mentioned across health and agriculture sectors but lacks depth in education and finance.' },
          { name: 'Human Impact & Inclusion', score: 28, level: 'Nascent', keyFinding: 'No digital literacy strategy, gender inclusion targets, or AI-driven job displacement mitigation.' },
          { name: 'Digital Infrastructure', score: 45, level: 'Developing', keyFinding: 'Broadband coverage at 42%; cloud infrastructure nascent; no national compute resource strategy.' },
          { name: 'Contextualization & Regional Fit', score: 50, level: 'Emerging', keyFinding: 'Some localization of AI use cases to agriculture and health but limited multi-lingual support.' },
        ],
      },
      gaps: {
        create: [
          { description: 'No dedicated AI funding mechanism or budget allocation in national strategy', dimension: 'AI Policy & Strategy', indicator: 'ITU-AI-RF 2.0 — Indicator 1.3', severity: 'Critical', recommendation: 'Establish a National AI Innovation Fund with annual budget allocation from Ministry of Finance.' },
          { description: 'Data governance framework lacks AI-specific provisions for training data and model accountability', dimension: 'Data & Model Ecosystem', indicator: 'ITU-AI-RF 2.0 — Indicator 3.2', severity: 'Critical', recommendation: 'Enact AI-specific data governance regulations covering training data provenance and model accountability.' },
          { description: 'No AI ethics framework, impact assessment requirement, or human oversight mechanism', dimension: 'AI Policy & Strategy', indicator: 'ITU-AI-RF 2.0 — Indicator 1.5', severity: 'Critical', recommendation: 'Develop a National AI Ethics Framework aligned with UNESCO AI Ethics Recommendations.' },
          { description: 'No comprehensive digital literacy program targeting rural populations', dimension: 'Human Impact & Inclusion', indicator: 'ITU-AI-RF 2.0 — Indicator 5.1', severity: 'Critical', recommendation: 'Launch a National Digital Literacy Initiative targeting 60% coverage in rural areas within 3 years.' },
          { description: 'AI skilling and workforce transition plan absent — no mention of job displacement', dimension: 'Human Impact & Inclusion', indicator: 'ITU-AI-RF 2.0 — Indicator 5.3', severity: 'Critical', recommendation: 'Develop an AI Workforce Transition Plan with reskilling programs and social safety nets.' },
          { description: 'No gender-inclusive AI targets or gender-disaggregated data collection mandate', dimension: 'Human Impact & Inclusion', indicator: 'ITU-AI-RF 2.0 — Indicator 5.2', severity: 'Moderate', recommendation: 'Mandate gender-disaggregated data collection and set minimum 40% female participation targets in AI programs.' },
          { description: 'National broadband plan not integrated with AI infrastructure roadmap', dimension: 'Digital Infrastructure', indicator: 'ITU-AI-RF 2.0 — Indicator 6.1', severity: 'Moderate', recommendation: 'Integrate broadband expansion with AI infrastructure requirements in the national connectivity plan.' },
          { description: 'No national compute resource strategy for AI workloads', dimension: 'Digital Infrastructure', indicator: 'ITU-AI-RF 2.0 — Indicator 6.4', severity: 'Moderate', recommendation: 'Develop a National Compute Strategy including public cloud procurement, GPU infrastructure, and research compute grants.' },
          { description: 'AI strategy weakly linked to national development plan and SDG targets', dimension: 'Strategy Alignment', indicator: 'ITU-AI-RF 2.0 — Indicator 2.1', severity: 'Moderate', recommendation: 'Create a cross-ministerial AI Task Force to map AI initiatives to specific SDG targets and national priorities.' },
          { description: 'No AI regulatory sandbox framework for testing AI applications', dimension: 'AI Policy & Strategy', indicator: 'ITU-AI-RF 2.0 — Indicator 1.4', severity: 'Moderate', recommendation: 'Establish an AI Regulatory Sandbox managed by the ICT regulator to enable controlled AI testing.' },
          { description: 'Limited multi-lingual AI support — local languages not represented in AI strategy', dimension: 'Contextualization & Regional Fit', indicator: 'ITU-AI-RF 2.0 — Indicator 7.2', severity: 'Moderate', recommendation: 'Include Swahili and other local languages as priority areas for NLP/AI research and development.' },
          { description: 'No open government data policy or data sharing framework for AI research', dimension: 'Data & Model Ecosystem', indicator: 'ITU-AI-RF 2.0 — Indicator 3.3', severity: 'Critical', recommendation: 'Enact an Open Government Data Policy with mandatory data sharing for public-interest AI research.' },
        ],
      },
      recommendations: {
        create: [
          { title: 'Establish National AI Coordination Council', action: 'Form a cross-ministerial AI task force with representatives from ICT, Health, Agriculture, Education, Finance, and Labour.', owner: 'Ministry of ICT / President\'s Office', resources: '2-3 FTE seconded staff', feasibility: 4, expectedOutcome: 'Coordinated AI governance structure operational within 6 months', risks: 'Inter-ministerial rivalry may slow formation', ituDimension: 'AI Policy & Strategy', sdgLink: 'SDG 9, SDG 16', timeHorizon: 'immediate' },
          { title: 'Launch AI Ethics Framework Consultation', action: 'Conduct a 3-month multi-stakeholder consultation to draft a National AI Ethics Framework.', owner: 'Ministry of ICT', resources: 'Consultant budget ~$50,000', feasibility: 4, expectedOutcome: 'Draft ethics framework ready for cabinet review in 4 months', risks: 'Consultation may surface divergent views', ituDimension: 'AI Policy & Strategy', sdgLink: 'SDG 16, SDG 10', timeHorizon: 'immediate' },
          { title: 'Develop Open Government Data Policy', action: 'Draft and enact an Open Government Data Policy mandating public sector data sharing for AI research.', owner: 'Ministry of ICT / NBS', resources: 'Policy drafting team, ~$100,000', feasibility: 3, expectedOutcome: 'Policy enacted within 12 months', risks: 'Data privacy concerns', ituDimension: 'Data & Model Ecosystem', sdgLink: 'SDG 9, SDG 17', timeHorizon: 'short-term' },
          { title: 'Deploy AI Regulatory Sandbox', action: 'Establish a regulatory sandbox for AI applications under the ICT regulator.', owner: 'TCRA (Regulator)', resources: 'Regulatory staff training, ~$200,000', feasibility: 3, expectedOutcome: 'Sandbox accepting applications within 12 months', risks: 'Regulatory capacity constraints', ituDimension: 'AI Policy & Strategy', sdgLink: 'SDG 9, SDG 8', timeHorizon: 'short-term' },
          { title: 'National Digital Literacy & AI Skilling Program', action: 'Design and deploy a nationwide digital literacy program targeting 60% rural coverage.', owner: 'Ministry of Education / Ministry of ICT', resources: '~$5M annually', feasibility: 3, expectedOutcome: '2M citizens trained in basic digital literacy', risks: 'Budget constraints and trainer availability', ituDimension: 'Human Impact & Inclusion', sdgLink: 'SDG 4, SDG 5, SDG 8', timeHorizon: 'medium-term' },
          { title: 'National Compute & Cloud Infrastructure Strategy', action: 'Develop a national strategy for AI compute resources including public cloud procurement and GPU clusters.', owner: 'Ministry of ICT / NICTBB', resources: '~$10-15M capital investment over 3 years', feasibility: 2, expectedOutcome: 'Government AI compute capacity established', risks: 'High capital cost', ituDimension: 'Digital Infrastructure', sdgLink: 'SDG 9, SDG 17', timeHorizon: 'medium-term' },
        ],
      },
      strengths: {
        create: [
          { description: 'Tanzania has a formal National ICT Policy (2023) that explicitly references AI as a priority technology area.' },
          { description: 'The country has enacted a Personal Data Protection Act (2022), establishing a foundational data governance framework.' },
          { description: 'AI use cases are identified in both agriculture (precision farming) and health (diagnostic support) sectors.' },
          { description: 'The strategy acknowledges alignment with the African Union Digital Transformation Strategy 2020-2030.' },
          { description: 'Tanzania participates in regional EAC digital transformation initiatives, providing collaboration infrastructure.' },
        ],
      },
      priorityActions: {
        create: [
          {
            title: 'Establish a National AI Coordination Council',
            description: 'Create a cross-ministerial body to oversee AI strategy implementation, allocate funding, and coordinate stakeholders.',
            rank: 1,
          },
          {
            title: 'Launch an AI Ethics & Regulatory Framework',
            description: 'Develop and adopt a national AI ethics framework aligned with UNESCO recommendations, including mandatory impact assessments.',
            rank: 2,
          },
          {
            title: 'Implement a Digital Literacy & Workforce Transition Program',
            description: 'Address the critical human impact gap by launching rural digital literacy initiatives and an AI workforce transition plan.',
            rank: 3,
          },
        ],
      },
    },
  })

  const rwanda = await prisma.assessment.create({
    data: {
      title: 'Rwanda AI Policy Framework 2024-2029',
      country: 'Rwanda',
      documentName: 'Rwanda National AI Policy 2024',
      overallScore: 64,
      readinessLevel: 'Emerging',
      userId: user.id,
      dimensions: {
        create: [
          { name: 'AI Policy & Strategy', score: 72, level: 'Emerging', keyFinding: 'Comprehensive AI policy with regulatory sandbox established under RURA oversight.' },
          { name: 'Strategy Alignment', score: 65, level: 'Emerging', keyFinding: 'Strong alignment with Vision 2050 and AU Digital Transformation Strategy; clear SDG mapping.' },
          { name: 'Data & Model Ecosystem', score: 58, level: 'Emerging', keyFinding: 'Open Data Policy enacted; data governance framework with privacy safeguards operational.' },
          { name: 'Cross-Domain Correlation', score: 55, level: 'Emerging', keyFinding: 'AI integrated across health, agriculture, finance, and education sector plans.' },
          { name: 'Human Impact & Inclusion', score: 60, level: 'Emerging', keyFinding: 'National digital literacy program reaches 60% of rural households through community ICT centres.' },
          { name: 'Digital Infrastructure', score: 70, level: 'Emerging', keyFinding: 'National broadband covers 75% of population; government cloud infrastructure operational.' },
          { name: 'Contextualization & Regional Fit', score: 68, level: 'Emerging', keyFinding: 'AI ethics framework aligns with UNESCO; multi-lingual considerations in policy design.' },
        ],
      },
      gaps: {
        create: [
          { description: 'AI workforce skills gap remains — limited university AI programmes', dimension: 'Human Impact & Inclusion', indicator: 'ITU-AI-RF 2.0 — Indicator 5.3', severity: 'Moderate', recommendation: 'Expand university AI programmes and establish vocational AI training centres.' },
          { description: 'AI compute infrastructure still limited for advanced research workloads', dimension: 'Digital Infrastructure', indicator: 'ITU-AI-RF 2.0 — Indicator 6.4', severity: 'Moderate', recommendation: 'Invest in national GPU cluster and research compute grants.' },
          { description: 'Cross-border data sharing framework for AI development absent', dimension: 'Data & Model Ecosystem', indicator: 'ITU-AI-RF 2.0 — Indicator 3.4', severity: 'Minor', recommendation: 'Develop regional data sharing agreements under EAC framework.' },
        ],
      },
      recommendations: {
        create: [
          { title: 'Scale AI Workforce Development', action: 'Establish AICentres of Excellence at University, Rwanda and vocational training programmes across all districts.', owner: 'Ministry of Education', resources: '~$8M annually', feasibility: 4, expectedOutcome: '5,000 AI practitioners trained within 3 years', risks: 'Faculty shortages may slow programme launch', ituDimension: 'Human Impact & Inclusion', sdgLink: 'SDG 4, SDG 8', timeHorizon: 'medium-term' },
        ],
      },
    },
  })

  console.log(`Seed complete: "${assessment.title}" for ${assessment.country} and "${rwanda.title}" for ${rwanda.country}`)
  console.log(`Login: admin@polylens.ai / password123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
