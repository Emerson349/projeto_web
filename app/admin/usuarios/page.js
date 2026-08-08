'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminUsersPage() {
  const { hasRole } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form para novo usuário
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('editor');
  const [submitting, setSubmitting] = useState(false);

  // Modal/Estado de edição
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Falha ao carregar lista de usuários.');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasRole(['admin'])) {
      fetchUsers();
    }
  }, [hasRole, fetchUsers]);

  if (!hasRole(['admin'])) {
    return (
      <div>
        <h2>Acesso Restrito</h2>
        <p>Apenas administradores podem gerenciar a equipe do sistema.</p>
      </div>
    );
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao criar usuário.');
      }

      setSuccess('Usuário cadastrado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      setRole('editor');
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!editingUser) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          is_active: editingUser.is_active,
          password: editingUser.newPassword || undefined
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao atualizar usuário.');
      }

      setSuccess('Usuário atualizado com sucesso!');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Gerenciamento de Equipe</h1>
          <p className="page-description">Gerencie os acessos de Administradores, Editores e Vendedores.</p>
        </div>
        <button
          className="button primary"
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setEditingUser(null);
          }}
        >
          {showForm ? 'Fechar formulário' : 'Novo Usuário'}
        </button>
      </div>

      {error ? (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '8px', marginBottom: '1rem' }}>
          {success}
        </div>
      ) : null}

      {showForm ? (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Cadastrar Novo Membro da Equipe</h2>
          <form className="form-grid" onSubmit={handleCreateUser}>
            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>Nome Completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>Senha Inicial</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>Perfil (Role)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Administrador (Acesso Total)</option>
                <option value="editor">Editor (Gestão de Produtos/Catálogo)</option>
                <option value="vendedor">Vendedor (Gestão de Pedidos/Status)</option>
              </select>
            </div>

            <button className="button" type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Cadastrar Usuário'}
            </button>
          </form>
        </div>
      ) : null}

      {editingUser ? (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Editar Usuário #{editingUser.id}</h2>
          <form className="form-grid" onSubmit={handleUpdateUser}>
            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>Nome</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>E-mail</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>Perfil (Role)</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </div>

            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>Status</label>
              <select
                value={editingUser.is_active ? '1' : '0'}
                onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.value === '1' })}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </div>

            <div className="form-row">
              <label style={{ color: '#334155', fontWeight: '700' }}>Nova Senha (deixe em branco se não desejar alterar)</label>
              <input
                type="password"
                placeholder="Preencha apenas para alterar"
                value={editingUser.newPassword || ''}
                onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button className="button secondary" type="button" onClick={() => setEditingUser(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', color: '#475569' }}>ID</th>
                <th style={{ padding: '0.75rem', color: '#475569' }}>Nome</th>
                <th style={{ padding: '0.75rem', color: '#475569' }}>E-mail</th>
                <th style={{ padding: '0.75rem', color: '#475569' }}>Perfil</th>
                <th style={{ padding: '0.75rem', color: '#475569' }}>Status</th>
                <th style={{ padding: '0.75rem', color: '#475569' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', color: '#334155' }}>#{u.id}</td>
                  <td style={{ padding: '0.75rem', fontWeight: '500', color: '#0f172a' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem', color: '#334155' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        background:
                          u.role === 'admin'
                            ? '#f3e8ff'
                            : u.role === 'editor'
                            ? '#dbeafe'
                            : '#dcfce7',
                        color:
                          u.role === 'admin'
                            ? '#7e22ce'
                            : u.role === 'editor'
                            ? '#1d4ed8'
                            : '#15803d'
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ color: u.is_active ? '#15803d' : '#b91c1c', fontWeight: '600', fontSize: '0.85rem' }}>
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      className="button secondary tiny"
                      type="button"
                      onClick={() => {
                        setEditingUser({ ...u, newPassword: '' });
                        setShowForm(false);
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
