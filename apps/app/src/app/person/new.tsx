import React from 'react';
import { router } from 'expo-router';
import { goBack } from '@/utils/nav';
import { PersonForm } from '@/components/PersonForm';
import { Screen } from '@/components/ui';

export default function NewPersonScreen() {
  return (
    <Screen>
      <PersonForm onSaved={(p) => router.replace({ pathname: '/person/[id]', params: { id: p.id } })} onCancel={() => goBack()} />
    </Screen>
  );
}
