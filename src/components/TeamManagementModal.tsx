'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { UserRole } from '@/lib/auth';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamManagementModal({ isOpen, onClose }: TeamManagementModalProps) {
  const { workspace, user, role, isOwner, inviteMember, removeMember } = useWorkspace();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !workspace) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await inviteMember(email.trim(), name.trim(), selectedRole);
    setIsSubmitting(false);

    if (res.success) {
      setEmail('');
      setName('');
      setStatusMessage({ text: `🎉 Invitation envoyée à ${email} avec succès !` });
    } else {
      setStatusMessage({ text: res.error || 'Erreur lors de l\'invitation', error: true });
    }
  };

  const handleRemove = async (memberUserId: string, memberName: string) => {
    if (!confirm(`Confirmer le retrait de ${memberName} de l'équipe ?`)) return;
    const res = await removeMember(memberUserId);
    if (res.success) {
      setStatusMessage({ text: `Membre retiré de l'équipe.` });
    } else {
      setStatusMessage({ text: res.error || 'Erreur lors du retrait', error: true });
    }
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join?ws=${workspace.id}&role=${selectedRole}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'owner':
        return { label: 'Propriétaire', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', icon: '👑' };
      case 'manager':
        return { label: 'Social Media Manager', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.12)', icon: '📱' };
      case 'designer':
        return { label: 'Graphiste / Designer', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)', icon: '🎨' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        maxWidth: '580px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        color: '#0F172A',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Espace Multi-Tenant & Équipe
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '6px 0 2px', color: '#0F172A' }}>
              Équipe de {workspace.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              {workspace.members.length} membres actifs • Forfait {workspace.plan.toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              fontSize: '1.4rem',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div style={{
            background: statusMessage.error ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${statusMessage.error ? '#FECDD3' : '#BBF7D0'}`,
            color: statusMessage.error ? '#991B1B' : '#166534',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '18px',
          }}>
            {statusMessage.text}
          </div>
        )}

        {/* Liste des membres */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Membres Actuels ({workspace.members.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {workspace.members.map((member) => {
              const badge = getRoleBadge(member.role);
              const isCurrentUser = member.userId === user?.id;

              return (
                <div
                  key={member.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: '#4F46E5',
                    }}>
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A' }}>
                        <span>{member.userName}</span>
                        {isCurrentUser && (
                          <span style={{ fontSize: '0.7rem', color: '#4F46E5', background: '#EEF2FF', padding: '2px 6px', borderRadius: '4px' }}>
                            (Vous)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{member.userEmail}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: badge.color,
                      background: badge.bg,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>

                    {isOwner && member.userId !== workspace.ownerId && (
                      <button
                        onClick={() => handleRemove(member.userId, member.userName)}
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECDD3',
                          color: '#E11D48',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Inviter un Collaborateur */}
        {(isOwner || role === 'manager') ? (
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '18px',
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4F46E5', marginBottom: '12px' }}>
              ➕ Inviter un Collaborateur à la Boutique
            </h4>
            <form onSubmit={handleInvite}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>
                    Nom ou Prénom
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Syrine"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>
                    Adresse E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="collaborateur@gmail.com"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '6px' }}>
                  Rôle & Permissions :
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('manager')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: selectedRole === 'manager' ? '#EEF2FF' : '#FFFFFF',
                      border: `1.5px solid ${selectedRole === 'manager' ? '#4F46E5' : '#CBD5E1'}`,
                      color: selectedRole === 'manager' ? '#4F46E5' : '#64748B',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    📱 Social Media Manager
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px', fontWeight: 400 }}>
                      Génération & Publications Darija
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('designer')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: selectedRole === 'designer' ? '#FAF5FF' : '#FFFFFF',
                      border: `1.5px solid ${selectedRole === 'designer' ? '#A855F7' : '#CBD5E1'}`,
                      color: selectedRole === 'designer' ? '#7E22CE' : '#64748B',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    🎨 Graphiste / Designer
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px', fontWeight: 400 }}>
                      Cadrage, Badges & Export ZIP
                    </div>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {isSubmitting ? 'Envoi...' : 'Envoyer l\'Invitation'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {copiedLink ? '✓ Lien copié !' : '📋 Copier Lien Direct'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
            🔒 Vous êtes en mode lecture/création ({role.toUpperCase()}). Seul le propriétaire ou le manager peut gérer les membres.
          </div>
        )}
      </div>
    </div>
  );
}
