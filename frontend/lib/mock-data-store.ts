// In-memory data store for Daystar Forms Portal in AI Studio

export interface StoredChurchZone {
  _id: string;
  zoneName: string;
  regionalPastorName: string;
  regionalPastorEmail: string;
  zonalCoordinatorName: string;
  zonalCoordinatorEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredUser {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  passwordHash: string; // or plain check for demo
  role: "superAdmin" | "admin" | "pastorate";
}

export interface StoredNotification {
  _id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  message: string;
  formType: string;
  formId: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  createdAt: string;
}

// Initial Church Zones
const initialZones: StoredChurchZone[] = [
  {
    _id: "zone-oregun",
    zoneName: "Oregun Zone",
    regionalPastorName: "Pastor Nike Adeyemi",
    regionalPastorEmail: "pastor.nike@daystarng.org",
    zonalCoordinatorName: "Deacon John Doe",
    zonalCoordinatorEmail: "coordinator.oregun@daystarng.org",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "zone-lekki",
    zoneName: "Lekki Zone",
    regionalPastorName: "Pastor Boye Oloyede",
    regionalPastorEmail: "pastor.boye@daystarng.org",
    zonalCoordinatorName: "Deaconess Mary Smith",
    zonalCoordinatorEmail: "coordinator.lekki@daystarng.org",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "zone-ikorodu",
    zoneName: "Ikorodu Zone",
    regionalPastorName: "Pastor Kenny Folarin",
    regionalPastorEmail: "pastor.kenny@daystarng.org",
    zonalCoordinatorName: "Bro. Emmanuel Adeleke",
    zonalCoordinatorEmail: "coordinator.ikorodu@daystarng.org",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "zone-alimosho",
    zoneName: "Alimosho Zone",
    regionalPastorName: "Pastor Sam Adeyemi",
    regionalPastorEmail: "pastor.sam@daystarng.org",
    zonalCoordinatorName: "Sis. Grace Okafor",
    zonalCoordinatorEmail: "coordinator.alimosho@daystarng.org",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "zone-ikeja",
    zoneName: "Ikeja Zone",
    regionalPastorName: "Pastor David Balogun",
    regionalPastorEmail: "pastor.david@daystarng.org",
    zonalCoordinatorName: "Bro. Tunde Bakare",
    zonalCoordinatorEmail: "coordinator.ikeja@daystarng.org",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "zone-vi",
    zoneName: "Victoria Island Zone",
    regionalPastorName: "Pastor Victor Johnson",
    regionalPastorEmail: "pastor.victor@daystarng.org",
    zonalCoordinatorName: "Sis. Chidinma Eze",
    zonalCoordinatorEmail: "coordinator.vi@daystarng.org",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Users
const initialUsers: StoredUser[] = [
  {
    id: "usr-superadmin",
    _id: "usr-superadmin",
    firstName: "Super",
    lastName: "Admin",
    name: "Super Admin",
    email: "superadmin@daystarng.org",
    passwordHash: "password123",
    role: "superAdmin",
  },
  {
    id: "usr-admin",
    _id: "usr-admin",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    email: "admin@daystarng.org",
    passwordHash: "password123",
    role: "admin",
  },
  {
    id: "usr-pastor",
    _id: "usr-pastor",
    firstName: "Pastor",
    lastName: "User",
    name: "Pastor User",
    email: "pastor@daystarng.org",
    passwordHash: "password123",
    role: "pastorate",
  },
];

// Initial Submissions
const initialNamingDedication = [
  {
    _id: "nd-1",
    formId: "naming_1001",
    fatherName: "Olumide Williams",
    fatherPhone: "+234 803 123 4567",
    motherName: "Blessing Williams",
    motherPhone: "+234 802 987 6543",
    homeAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
    worshipCenter: "Lekki Zone",
    churchZoneId: "zone-lekki",
    ceremonyType: "Dedication in Church",
    status: "approved",
    babies: [
      {
        name: "David Ayomide Williams",
        sex: "Male",
        dateOfBirth: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    ],
    placeOfBirth: "St. Nicholas Hospital, Lagos",
    intendedDedicationDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: "nd-2",
    formId: "naming_1002",
    fatherName: "Chinedu Okeke",
    fatherPhone: "+234 805 444 3322",
    motherName: "Amaka Okeke",
    motherPhone: "+234 807 111 2233",
    homeAddress: "45 Allen Avenue, Ikeja, Lagos",
    worshipCenter: "Oregun Zone",
    churchZoneId: "zone-oregun",
    ceremonyType: "Naming Ceremony at Home",
    status: "pending",
    babies: [
      {
        name: "Chimamanda Joy Okeke",
        sex: "Female",
        dateOfBirth: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
    placeOfBirth: "Mother & Child Center, Ikeja",
    intendedNamingDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const initialCourtship = [
  {
    _id: "ct-1",
    formId: "courtship_2001",
    churchZoneId: "zone-oregun",
    churchZone: "Oregun Zone",
    brother: {
      firstName: "Michael",
      lastName: "Adeleke",
      email: "michael.adeleke@example.com",
      phone: "+234 803 555 1234",
    },
    sister: {
      firstName: "Toyin",
      lastName: "Ogunleye",
      email: "toyin.ogunleye@example.com",
      phone: "+234 802 666 5678",
    },
    status: "pending",
    counselingClassesAttended: 4,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: "ct-2",
    formId: "courtship_2002",
    churchZoneId: "zone-lekki",
    churchZone: "Lekki Zone",
    brother: {
      firstName: "Femi",
      lastName: "Ojo",
      email: "femi.ojo@example.com",
      phone: "+234 801 777 8899",
    },
    sister: {
      firstName: "Kemi",
      lastName: "Alabi",
      email: "kemi.alabi@example.com",
      phone: "+234 809 333 4455",
    },
    status: "completed",
    counselingClassesAttended: 15,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const initialBurial = [
  {
    _id: "br-1",
    formId: "burial_3001",
    fullNameOfDeceased: "Elder Samuel Babatunde",
    dateOfBirth: new Date(1948, 4, 15).toISOString(),
    dateOfDeath: new Date(Date.now() - 20 * 86400000).toISOString(),
    ageAtTimeOfDeath: "78",
    causeOfDeath: "Natural causes",
    maritalStatus: "Married",
    churchInvolvement: "Conduct Funeral Service and Internment",
    zonalCoordinator: "Deacon John Doe",
    zone: "Oregun Zone",
    region: "Lagos Central",
    regionalPastor: "Pastor Nike Adeyemi",
    status: "completed",
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// Global in-memory singleton to persist state during runtime
const globalStore = (globalThis as any).__DAYSTAR_STORE__ || {
  zones: [...initialZones],
  users: [...initialUsers],
  namingDedication: [...initialNamingDedication],
  courtship: [...initialCourtship],
  burial: [...initialBurial],
  initiations: new Map<string, any>(),
  notifications: [
    {
      _id: "notif-1",
      recipientEmail: "pastor.nike@daystarng.org",
      recipientName: "Pastor Nike Adeyemi",
      subject: "New Naming & Dedication Form Submission",
      message: "A new naming form for Chimamanda Joy Okeke has been submitted.",
      formType: "naming_dedication",
      formId: "nd-2",
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
};

if (!(globalThis as any).__DAYSTAR_STORE__) {
  (globalThis as any).__DAYSTAR_STORE__ = globalStore;
}

export const dataStore = globalStore;
