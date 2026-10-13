import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/utils/nav';
import { PersonForm } from '@/components/PersonForm';
import { Body, Screen } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';

export default function EditPersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { people } = useData();
  const t = useT();
  const person = people.find((p) => p.id === id);
  if (!person) {
    return (
      <Screen style={{ padding: 24 }}>
        <Body muted>{t('person.notFound')}</Body>
      </Screen>
    );
  }
  return (
    <Screen>
      <PersonForm initial={person} onSaved={() => goBack()} onCancel={() => goBack()} />
    </Screen>
  );
}
