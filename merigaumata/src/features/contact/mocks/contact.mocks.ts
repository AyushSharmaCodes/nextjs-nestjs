import { FAQ } from '../types/contact.types';

export const MOCK_CONTACT_FAQS: FAQ[] = [
  {
    id: 0,
    question: "How can I visit the sanctuary?",
    answer: "We welcome visitors all year round! To ensure the best experience for both you and our cows, we kindly ask that you schedule your visit at least 48 hours in advance using our simple online booking system or by giving us a call.",
    open: true
  },
  {
    id: 1,
    question: "What items can I donate directly?",
    answer: "We greatly appreciate in-kind donations. Items we currently need most include clean blankets, medical supplies, high-quality fodder, and building materials for shelter repairs. Please contact us before bringing large items or quantities.",
    open: false
  },
  {
    id: 2,
    question: "Do you offer volunteer programs for groups?",
    answer: "Yes, we host corporate groups, schools, and community organizations for meaningful volunteer days. These typically include a guided tour, hands-on tasks, and lunch. Please reach out to our volunteer coordinator to plan your group's visit.",
    open: false
  },
  {
    id: 3,
    question: "Is there a minimum commitment to become a volunteer?",
    answer: "We have flexible volunteering options. While some roles require regular commitment, we also have one-off event volunteering and short-term projects that fit any schedule. Every hand makes a difference!",
    open: false
  },
  {
    id: 4,
    question: "Are my donations tax-deductible?",
    answer: "Yes, we are a registered non-profit organization. All monetary donations are eligible for tax deduction under applicable laws. You will receive an official receipt for your contribution via email.",
    open: false
  }
];

export const MOCK_FAQS: FAQ[] = [
  { id: 0, question: 'Are your products vegan and cruelty-free?', answer: 'Yes, all our wellness and spiritual products are 100% vegan, cruelty-free, and chemical-free. We treat our cows with the highest love and respect at our sacred Vrindavan Valley sanctuary, using sustainable dairy methods that put their welfare and health first.', open: true },
  { id: 1, question: 'Do your products contain synthetic parabens or sulfates?', answer: 'Absolutely not. All offerings are prepared in strict accordance with Vedic tradition and organic standards. We preserve and package everything without chemical preservatives, artificial colors, or foaming sulfates.', open: false },
  { id: 2, question: 'Are these products suitable for highly sensitive skin?', answer: 'Yes, our wellness and spiritual range is specifically formulated to be gentle and hypoallergenic. We use nourishing organic ingredients like cold-pressed oils, sacred herbs, and gentle extracts to nurture the skin.', open: false },
  { id: 3, question: 'How do I know which product is right for my family?', answer: 'We suggest exploring our shop categories: Dairy for nutrient-rich Vedic nutrition, Wellness for pure body care, Spiritual for aromatic meditation tools, and Agriculture for chemical-free soil care. You can find detailed descriptions and guidelines on every package.', open: false },
  { id: 4, question: 'Where are your products made and sourced?', answer: 'Our products are crafted and sourced ethically in small batches directly from our natural Goshala sanctuary in Vrindavan. Every purchase directly funds the lifetime shelter, feeding, and medical care of our sacred cows.', open: false }
];
