import { Text } from '@atoms';
import { Container } from '@components';
import { app } from 'src/api/app';

export default function Page() {
  const { data } = app.reading.getCurrentlyReading.useQuery();

  return (
    <Container>
      <Text>Reading</Text>
      <Text>{JSON.stringify({ data })}</Text>
    </Container>
  );
}
