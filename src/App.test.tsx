import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { SAMPLE_DATA } from './db/seed'

describe('App', () => {
  it('offers sample data on first launch and shows the seeded history newest first', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Welcome to MaintLog' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Load sample data' }))

    const list = await screen.findByRole('list', { name: 'Vehicles' })
    for (const sample of SAMPLE_DATA) {
      expect(within(list).getByText(sample.vehicle.name)).toBeInTheDocument()
    }

    // The first sample vehicle is selected automatically after seeding.
    const first = SAMPLE_DATA[0]!
    expect(await screen.findByRole('heading', { name: first.vehicle.name })).toBeInTheDocument()

    const history = await screen.findByRole('list', { name: 'Service records' })
    const tasks = within(history)
      .getAllByRole('listitem')
      .map((li) => li.querySelector('.record-task')?.textContent)
    const expected = [...first.records].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).map((r) => r.task)
    expect(tasks).toEqual(expected)
  })

  it('lets the user add a vehicle and a service record', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Add my first vehicle' }))

    const vehicleForm = screen.getByRole('form', { name: 'New vehicle' })
    await user.selectOptions(within(vehicleForm).getByLabelText('Type'), 'outboard')
    await user.type(within(vehicleForm).getByLabelText('Name'), 'Test outboard')
    await user.click(within(vehicleForm).getByRole('button', { name: 'Add vehicle' }))

    expect(await screen.findByRole('heading', { name: 'Test outboard' })).toBeInTheDocument()
    expect(screen.getByText('No service records yet.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add record' }))
    const recordForm = screen.getByRole('form', { name: 'New service record' })
    // Outboards are measured in engine hours.
    const meter = within(recordForm).getByLabelText(/Engine hours/)
    await user.clear(meter)
    await user.type(meter, '12.5')
    await user.type(within(recordForm).getByLabelText('Task'), 'Gear oil change')
    await user.type(within(recordForm).getByLabelText(/Parts and fluids/), 'Gear oil 0.5 L')
    await user.click(within(recordForm).getByRole('button', { name: 'Add record' }))

    const history = await screen.findByRole('list', { name: 'Service records' })
    expect(within(history).getByText('Gear oil change')).toBeInTheDocument()
    expect(within(history).getByText('12.5 h')).toBeInTheDocument()
    expect(within(history).getByText('Gear oil 0.5 L')).toBeInTheDocument()
  })
})
