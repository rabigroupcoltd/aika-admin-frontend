import { useState } from 'react';
import { Button, Card, Input, Select } from '@/components/ui';
import { CreateStaffManager } from '@/modules/users/usersController';
import type { StaffRole } from '@/modules/users/type';
import { parseApiError } from '@/utils/parseApiError';

const STAFF_ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: 'SUPPORT', label: 'Support — tickets, orders, drivers, users' },
  { value: 'ADMIN', label: 'Admin — everything' },
];

export function CreateStaffCard({ onDone }: { onDone: () => void }) {
  const { createStaff, isLoading } = CreateStaffManager();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('SUPPORT');
  const [formError, setFormError] = useState<string | null>(null);

  const valid = name.trim().length >= 2 && email.trim().length > 3 && password.length >= 8;

  async function submit() {
    setFormError(null);
    try {
      await createStaff({ name: name.trim(), email: email.trim(), password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('SUPPORT');
      onDone();
    } catch (e) {
      setFormError(parseApiError(e));
    }
  }

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-aiko-dark-900 dark:text-white">
          New staff account
        </h3>
        <p className="mt-0.5 text-sm text-aiko-dark-500">
          Password-authenticated, same as the seeded admin. Share the password with them
          out of band — there is no invite email yet.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Name
          </label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Amina Yusuf" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="support@aiko.ng"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Initial password
          </label>
          <Input
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-aiko-dark-700 dark:text-aiko-dark-200">
            Role
          </label>
          <Select value={role} onChange={(event) => setRole(event.target.value as StaffRole)}>
            {STAFF_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {formError ? <p className="mt-3 text-sm text-red-600">{formError}</p> : null}

      <div className="mt-4">
        <Button loading={isLoading} disabled={!valid} onClick={() => void submit()}>
          Create account
        </Button>
      </div>
    </Card>
  );
}
