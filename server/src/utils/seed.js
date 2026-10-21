require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const Message = require('../models/Message');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing demo records...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Complaint.deleteMany({}),
      Message.deleteMany({}),
      Feedback.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    // 1. Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@complaintportal.com',
      password: 'Admin@12345',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+91 99999 00001',
      department: 'System Administration',
    });

    // 2. Agents
    const agentSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'agent.sarah@complaintportal.com',
      password: 'Agent@12345',
      role: 'AGENT',
      status: 'ACTIVE',
      phone: '+91 98888 11111',
      department: 'Technical Support',
    });

    const agentRajesh = await User.create({
      name: 'Rajesh Kumar',
      email: 'agent.rajesh@complaintportal.com',
      password: 'Agent@12345',
      role: 'AGENT',
      status: 'ACTIVE',
      phone: '+91 97777 22222',
      department: 'Billing & Accounts',
    });

    const agentEmily = await User.create({
      name: 'Emily Watson',
      email: 'agent.emily@complaintportal.com',
      password: 'Agent@12345',
      role: 'AGENT',
      status: 'ACTIVE',
      phone: '+91 96666 33333',
      department: 'Facilities & Operations',
    });

    // 3. Ordinary Users
    const userPriya = await User.create({
      name: 'Priya Sharma',
      email: 'user.priya@complaintportal.com',
      password: 'User@12345',
      role: 'USER',
      status: 'ACTIVE',
      phone: '+91 98765 43210',
    });

    const userAlex = await User.create({
      name: 'Alex Martinez',
      email: 'user.alex@complaintportal.com',
      password: 'User@12345',
      role: 'USER',
      status: 'ACTIVE',
      phone: '+1 555-0199',
    });

    console.log('[Seed] Creating default complaint categories...');
    const categoriesData = [
      { name: 'Technical Support', description: 'Hardware, software, networking, and platform access errors' },
      { name: 'Billing & Payments', description: 'Fee deductions, duplicate charges, payment receipts, refunds' },
      { name: 'Facilities & Maintenance', description: 'Air conditioning, power supply, electrical, plumbing, sanitation' },
      { name: 'Academic & Examination', description: 'Course enrollments, hall tickets, grade queries, lab access' },
      { name: 'Hostel & Mess', description: 'Hostel accommodation, internet speed, canteen food quality' },
      { name: 'Security & Access', description: 'ID cards, gate passes, parking access, campus surveillance' },
    ];
    await Category.insertMany(categoriesData);

    console.log('[Seed] Creating realistic sample complaints across lifecycle...');

    // Complaint 1: Submitted (Fresh)
    const c1 = await Complaint.create({
      complaintNumber: 'CMP-20261021-0001',
      title: 'Hostel Block-C 3rd Floor Wi-Fi Router Unreachable',
      description: 'The Wi-Fi access point in Block-C 3rd floor corridor has been blinking red since morning. Students are unable to access academic course portals.',
      category: 'Technical Support',
      priority: 'HIGH',
      user: userPriya._id,
      contactPhone: '+91 98765 43210',
      contactAddress: 'Hostel Block C, Room 304',
      status: 'Submitted',
      history: [
        {
          previousStatus: '',
          newStatus: 'Submitted',
          action: 'COMPLAINT_SUBMITTED',
          actor: userPriya._id,
          actorName: userPriya.name,
          actorRole: userPriya.role,
          note: 'Complaint submitted via web portal.',
          timestamp: new Date(Date.now() - 4 * 3600 * 1000),
        },
      ],
    });

    // Complaint 2: Assigned to Sarah
    const c2 = await Complaint.create({
      complaintNumber: 'CMP-20261021-0002',
      title: 'Double deduction on semester examination fee',
      description: 'While paying the exam fee on the college gateway, the transaction timed out once and was charged twice on my debit card. Transaction IDs are TXN89211 and TXN89212.',
      category: 'Billing & Payments',
      priority: 'URGENT',
      user: userAlex._id,
      assignedAgent: agentRajesh._id,
      contactPhone: '+1 555-0199',
      contactAddress: 'Campus Accounts Wing, Student ID #CS2109',
      status: 'Assigned',
      history: [
        {
          previousStatus: '',
          newStatus: 'Submitted',
          action: 'COMPLAINT_SUBMITTED',
          actor: userAlex._id,
          actorName: userAlex.name,
          actorRole: userAlex.role,
          note: 'Submitted with transaction proofs.',
          timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Assigned',
          action: 'AGENT_ASSIGNED',
          actor: admin._id,
          actorName: admin.name,
          actorRole: admin.role,
          note: `Assigned to ${agentRajesh.name} in Billing & Accounts.`,
          timestamp: new Date(Date.now() - 18 * 3600 * 1000),
        },
      ],
    });

    // Complaint 3: In Progress (Sarah working with Priya, with live chat)
    const c3 = await Complaint.create({
      complaintNumber: 'CMP-20261021-0003',
      title: 'Computer Lab 4 Workstation #12 Power Supply Trip',
      description: 'Workstation 12 abruptly shut down during compilers lab session with an electrical burning odor. Needs immediate hardware diagnosis.',
      category: 'Facilities & Maintenance',
      priority: 'HIGH',
      user: userPriya._id,
      assignedAgent: agentSarah._id,
      contactPhone: '+91 98765 43210',
      contactAddress: 'Department of CSE, Lab 4, Desk 12',
      status: 'In Progress',
      history: [
        {
          previousStatus: '',
          newStatus: 'Submitted',
          action: 'COMPLAINT_SUBMITTED',
          actor: userPriya._id,
          actorName: userPriya.name,
          actorRole: userPriya.role,
          note: 'Reported by lab student.',
          timestamp: new Date(Date.now() - 48 * 3600 * 1000),
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Assigned',
          action: 'AGENT_ASSIGNED',
          actor: admin._id,
          actorName: admin.name,
          actorRole: admin.role,
          note: `Assigned to ${agentSarah.name}.`,
          timestamp: new Date(Date.now() - 36 * 3600 * 1000),
        },
        {
          previousStatus: 'Assigned',
          newStatus: 'In Progress',
          action: 'STATUS_UPDATED',
          actor: agentSarah._id,
          actorName: agentSarah.name,
          actorRole: agentSarah.role,
          note: 'Technician dispatched with replacement 550W PSU and multimeter.',
          timestamp: new Date(Date.now() - 20 * 3600 * 1000),
        },
      ],
    });

    // Complaint 4: Resolved with 5-star Feedback
    const c4 = await Complaint.create({
      complaintNumber: 'CMP-20261021-0004',
      title: 'Library Portal Single Sign-On Account Locked',
      description: 'Unable to login to IEEE Xplore and Springer digital libraries through institutional email SSO.',
      category: 'Technical Support',
      priority: 'MEDIUM',
      user: userPriya._id,
      assignedAgent: agentSarah._id,
      contactPhone: '+91 98765 43210',
      contactAddress: 'Central Library, Reading Hall B',
      status: 'Resolved',
      resolutionNotes: 'Reset LDAP credentials, re-synced SAML assertion tokens with identity provider. Student verified successful login.',
      resolvedAt: new Date(Date.now() - 10 * 3600 * 1000),
      history: [
        {
          previousStatus: '',
          newStatus: 'Submitted',
          action: 'COMPLAINT_SUBMITTED',
          actor: userPriya._id,
          actorName: userPriya.name,
          actorRole: userPriya.role,
          note: 'SSO error reported.',
          timestamp: new Date(Date.now() - 72 * 3600 * 1000),
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Assigned',
          action: 'AGENT_ASSIGNED',
          actor: admin._id,
          actorName: admin.name,
          actorRole: admin.role,
          note: `Assigned to ${agentSarah.name}.`,
          timestamp: new Date(Date.now() - 50 * 3600 * 1000),
        },
        {
          previousStatus: 'Assigned',
          newStatus: 'In Progress',
          action: 'STATUS_UPDATED',
          actor: agentSarah._id,
          actorName: agentSarah.name,
          actorRole: agentSarah.role,
          note: 'Investigating LDAP directory sync.',
          timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        },
        {
          previousStatus: 'In Progress',
          newStatus: 'Resolved',
          action: 'STATUS_UPDATED',
          actor: agentSarah._id,
          actorName: agentSarah.name,
          actorRole: agentSarah.role,
          note: 'Reset LDAP credentials, re-synced SAML assertion tokens with identity provider. Student verified successful login.',
          timestamp: new Date(Date.now() - 10 * 3600 * 1000),
        },
        {
          previousStatus: 'Resolved',
          newStatus: 'Resolved',
          action: 'FEEDBACK_SUBMITTED',
          actor: userPriya._id,
          actorName: userPriya.name,
          actorRole: userPriya.role,
          note: 'User rated 5/5 stars. Review: "Resolved very quickly! Able to download research papers now."',
          timestamp: new Date(Date.now() - 8 * 3600 * 1000),
        },
      ],
    });

    // 5-star feedback for c4
    await Feedback.create({
      complaint: c4._id,
      user: userPriya._id,
      rating: 5,
      comments: 'Resolved very quickly! Able to download research papers now. Excellent support from Sarah.',
    });

    // Complaint 5: Reopened
    const c5 = await Complaint.create({
      complaintNumber: 'CMP-20261021-0005',
      title: 'Water cooler filtration unit leaking on CSE 2nd floor',
      description: 'Water filtration spout is leaking and puddle is forming near class 201.',
      category: 'Facilities & Maintenance',
      priority: 'MEDIUM',
      user: userAlex._id,
      assignedAgent: agentEmily._id,
      contactPhone: '+1 555-0199',
      contactAddress: 'CSE Academic Block, 2nd Floor Corridor',
      status: 'Reopened',
      reopenReason: 'The technician tightened the tap, but water is still dripping from underneath the filter housing valve.',
      history: [
        {
          previousStatus: '',
          newStatus: 'Submitted',
          action: 'COMPLAINT_SUBMITTED',
          actor: userAlex._id,
          actorName: userAlex.name,
          actorRole: userAlex.role,
          note: 'Reported water leak.',
          timestamp: new Date(Date.now() - 80 * 3600 * 1000),
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Assigned',
          action: 'AGENT_ASSIGNED',
          actor: admin._id,
          actorName: admin.name,
          actorRole: admin.role,
          note: `Assigned to ${agentEmily.name}.`,
          timestamp: new Date(Date.now() - 60 * 3600 * 1000),
        },
        {
          previousStatus: 'Assigned',
          newStatus: 'In Progress',
          action: 'STATUS_UPDATED',
          actor: agentEmily._id,
          actorName: agentEmily.name,
          actorRole: agentEmily.role,
          note: 'Plumber visited location.',
          timestamp: new Date(Date.now() - 40 * 3600 * 1000),
        },
        {
          previousStatus: 'In Progress',
          newStatus: 'Resolved',
          action: 'STATUS_UPDATED',
          actor: agentEmily._id,
          actorName: agentEmily.name,
          actorRole: agentEmily.role,
          note: 'Tightened dispensing tap valve.',
          timestamp: new Date(Date.now() - 20 * 3600 * 1000),
        },
        {
          previousStatus: 'Resolved',
          newStatus: 'Reopened',
          action: 'COMPLAINT_REOPENED',
          actor: userAlex._id,
          actorName: userAlex.name,
          actorRole: userAlex.role,
          note: 'Reopened by user. Reason: The technician tightened the tap, but water is still dripping from underneath the filter housing valve.',
          timestamp: new Date(Date.now() - 5 * 3600 * 1000),
        },
      ],
    });

    console.log('[Seed] Creating demo conversation messages for Complaint #3...');
    await Message.create([
      {
        complaint: c3._id,
        sender: userPriya._id,
        senderName: userPriya.name,
        senderRole: userPriya.role,
        message: 'Hello Agent Sarah, does the team need the lab assistant to unlock the CPU casing?',
        readBy: [userPriya._id, agentSarah._id],
        createdAt: new Date(Date.now() - 15 * 3600 * 1000),
      },
      {
        complaint: c3._id,
        sender: agentSarah._id,
        senderName: agentSarah.name,
        senderRole: agentSarah.role,
        message: 'Hi Priya! Yes, our technician Mr. Robert is on his way to Lab 4 now with keys and a spare SMPS unit.',
        readBy: [userPriya._id, agentSarah._id],
        createdAt: new Date(Date.now() - 12 * 3600 * 1000),
      },
      {
        complaint: c3._id,
        sender: userPriya._id,
        senderName: userPriya.name,
        senderRole: userPriya.role,
        message: 'Great, thank you! I have informed the lab in-charge.',
        readBy: [userPriya._id],
        createdAt: new Date(Date.now() - 10 * 3600 * 1000),
      },
    ]);

    console.log('[Seed] Creating sample notifications...');
    await Notification.create([
      {
        recipient: userPriya._id,
        type: 'STATUS_UPDATE',
        title: 'Technician Dispatched',
        message: 'Complaint #CMP-20261021-0003 status changed to In Progress.',
        relatedComplaint: c3._id,
        read: false,
      },
      {
        recipient: agentSarah._id,
        type: 'MESSAGE',
        title: 'New message on #CMP-20261021-0003',
        message: 'Priya Sharma: "Great, thank you! I have informed the lab in-charge."',
        relatedComplaint: c3._id,
        read: false,
      },
      {
        recipient: agentEmily._id,
        type: 'REOPENED',
        title: 'Complaint Reopened',
        message: 'Complaint #CMP-20261021-0005 has been reopened by user Alex Martinez.',
        relatedComplaint: c5._id,
        read: false,
      },
    ]);

    console.log('[Seed] Creating audit logs...');
    await AuditLog.create([
      {
        actor: admin._id,
        actorEmail: admin.email,
        actorRole: admin.role,
        action: 'AGENT_ASSIGNED',
        targetType: 'COMPLAINT',
        targetId: String(c2._id),
        details: { complaintNumber: c2.complaintNumber, agentName: agentRajesh.name },
        ipAddress: '127.0.0.1',
      },
      {
        actor: admin._id,
        actorEmail: admin.email,
        actorRole: admin.role,
        action: 'AGENT_ASSIGNED',
        targetType: 'COMPLAINT',
        targetId: String(c3._id),
        details: { complaintNumber: c3.complaintNumber, agentName: agentSarah.name },
        ipAddress: '127.0.0.1',
      },
    ]);

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! DEMO CREDENTIALS:');
    console.log('====================================================');
    console.log('1. Administrator:');
    console.log('   Email:    admin@complaintportal.com');
    console.log('   Password: Admin@12345');
    console.log('----------------------------------------------------');
    console.log('2. Support Agent 1 (Technical):');
    console.log('   Email:    agent.sarah@complaintportal.com');
    console.log('   Password: Agent@12345');
    console.log('----------------------------------------------------');
    console.log('3. Support Agent 2 (Billing):');
    console.log('   Email:    agent.rajesh@complaintportal.com');
    console.log('   Password: Agent@12345');
    console.log('----------------------------------------------------');
    console.log('4. Ordinary User 1:');
    console.log('   Email:    user.priya@complaintportal.com');
    console.log('   Password: User@12345');
    console.log('----------------------------------------------------');
    console.log('5. Ordinary User 2:');
    console.log('   Email:    user.alex@complaintportal.com');
    console.log('   Password: User@12345');
    console.log('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedData();
