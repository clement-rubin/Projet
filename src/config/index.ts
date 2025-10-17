import type { SiteConfig, SiteContent } from "../types";

export const SITE_CONFIG: SiteConfig = {
  title: "Clément RUBIN - Portfolio",
  author: "Clément RUBIN",
  description:
    "Étudiant en 3ème année à JUNIA LILLE, passionné par le numérique, l'IA et le big data.",
  lang: "fr",
  siteLogo: "/1708715521672.jpg",
  navLinks: [
    { text: "Experience", href: "#experience" },
    { text: "Bénévolat", href: "#volunteer" },
    { text: "Projects", href: "#projects" },
    { text: "About", href: "#about" },
  ],
  socialLinks: [
    { text: "Twitter", href: "https://github.com/immois/astro-zen" },
    { text: "LinkedIn", href: "https://www.linkedin.com/in/cl%C3%A9ment-rubin-098bb92aa/" },
    { text: "Github", href: "https://github.com/immois/astro-zen" },
    { text: "Youtube", href: "https://github.com/immois/astro-zen" },
    { text: "Dribbble", href: "https://github.com/immois/astro-zen" },
  ],
  socialImage: "/zen-og.png",
  canonicalURL: "https://astro-zen.vercel.app",
};

export const SITE_CONTENT: SiteContent = {
  hero: {
    name: "Clément RUBIN ",
    specialty: "Etudiant de 3ème année à JUNIA LILLE",
    summary:
      "Actuellement étudiant en 1ère année de Cycle Igénieur Informatique et réseaux. Je suis passionné par le numérique, l'IA et le big data.",
    email: "clement.rubin@student.junia.com",
  },
  experience: [
    {
      company: "TotalEnergies",
      position: "Agent administratif",
      startDate: "Juillet 2023",
      endDate: "Août 2023",
      summary: [
        "Gestion des stocks et inventaire des biens sur site.",
        "Préparation et présentation au cours d'une réunion du travail effectué.",
        "Sensibilisation au monde de l'entreprise et à la sécurité.",
      ],
    },
    {
      company: "La Nomande de nettoyage",
      position: "Agent d'entretien",
      startDate: "juin 2024",
      endDate: "juillet 2024",
      summary: [
        "Nettoyage et entretien des locaux commerciaux et résidentiels.",
        "Utilisation de produits et d'équipements de nettoyage spécialisés.",
        "Respect des normes de sécurité et des protocoles de nettoyage.",
      ],
    },
    {
      company: "Departement de la Seine-Maritime",
      position: "Membre du Conseil départemental des collégiens",
      startDate: "sept 2015",
      endDate: "sept 2017",
      summary: ["En tant que conseiller départemental des collégiens en Seine-Maritime. Mon rôle a consisté à proposer et à mettre en œuvre des projets éducatifs, culturels et citoyens, favorisant l’engagement et la responsabilisation des jeunes au sein de notre collectivité. Cette expérience m’a permis de développer des compétences en communication, travail d’équipe et leadership, tout en contribuant au bien-être et à l’épanouissement des collégiens du département."],
    },
  ],
  volunteer: [
    {
      
      organization: "Association locale d'aide aux devoirs",
      role: "Bénévole tuteur",
      startDate: "Septembre 2022",
      endDate: "Juin 2023",
      summary: [
        "Accompagnement scolaire d'élèves en difficulté en mathématiques et informatique.",
        "Organisation d'ateliers d'initiation au numérique pour les seniors.",
        "Participation à la coordination des activités bénévoles.",
      ],
    },
    {
      organization: "Croix-Rouge française",
      role: "Bénévole secouriste",
      startDate: "Mars 2023",
      endDate: "Présent",
      summary: [
        "Formation aux premiers secours et gestes de survie.",
        "Participation aux missions de secours lors d'événements locaux.",
        "Sensibilisation du public aux gestes de premiers secours.",
      ],
    },
  ],
  projects: [
    {
      name: "Spotifu Music",
      summary: "A music streaming app that emulates Spotify's core features.",
      linkPreview: "/",
      linkSource: "https://github.com/immois/astro-zen",
      image: "/spotifu.png",
    },
    {
      name: "Shopp App",
      summary: "An e-commerce platform that replicates Shopify's key features.",
      linkPreview: "/",
      linkSource: "https://github.com/immois/astro-zen",
      image: "/shopify-clon.png",
    },
    {
      name: "ClonTagram",
      summary: "A social network that replicates the features of Instagram",
      linkPreview: "/",
      linkSource: "https://github.com/immois/astro-zen",
      image: "/clone-ig.png",
    },
  ],
  about: {
    description: `
      Hi, I’m Alejandro Múnez, a passionate Mobile and Web Developer with a knack for crafting seamless digital experiences. With a strong background in both Android and iOS development, as well as front-end web technologies, I thrive in the intersection where creativity meets technology.

      Over the years, I’ve honed my skills in building robust, user-friendly applications that not only meet the needs of users but also push the boundaries of what’s possible. My projects range from innovative mobile applications to responsive web designs, all with a focus on performance, security, and scalability.
    `,
    image: "/alejandro-big.jpg",
  },
};

// #5755ff
