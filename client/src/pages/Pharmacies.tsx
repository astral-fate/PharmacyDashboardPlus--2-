import React, { useState } from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Pharmacy, Location } from 'db/schema';

const PharmacyForm = ({ pharmacy, onSubmit, onClose }: any) => {
  const { data: locations } = useSWR<Location[]>('/api/locations');
  const [formData, setFormData] = useState(pharmacy || {
    name: '',
    locationId: '',
    phone: '',
    email: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Pharmacy Name"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <select
        className="w-full p-2 border rounded"
        value={formData.locationId}
        onChange={e => setFormData({ ...formData, locationId: e.target.value })}
        required
      >
        <option value="">Select Location</option>
        {locations?.map(location => (
          <option key={location.id} value={location.id}>
            {location.address}, {location.city}
          </option>
        ))}
      </select>
      <Input
        placeholder="Phone"
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <Input
        placeholder="Email"
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />
      <select
        className="w-full p-2 border rounded"
        value={formData.status}
        onChange={e => setFormData({ ...formData, status: e.target.value })}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <Button type="submit">
        {pharmacy ? 'Update Pharmacy' : 'Add Pharmacy'}
      </Button>
    </form>
  );
};

const Pharmacies = () => {
  const { data: pharmacies, mutate } = useSWR<Pharmacy[]>('/api/pharmacies');
  const { data: locations } = useSWR<Location[]>('/api/locations');
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  const getLocationAddress = (locationId: number) => {
    const location = locations?.find(l => l.id === locationId);
    return location ? `${location.address}, ${location.city}` : 'Unknown Location';
  };

  const filteredPharmacies = pharmacies?.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/pharmacies', {
        method: selectedPharmacy ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        mutate();
        toast({
          title: `Pharmacy ${selectedPharmacy ? 'updated' : 'added'} successfully`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save pharmacy",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pharmacy?')) return;

    try {
      const response = await fetch(`/api/pharmacies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
        toast({
          title: "Pharmacy deleted successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete pharmacy",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <TopBar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search pharmacies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedPharmacy(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pharmacy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}
                  </DialogTitle>
                </DialogHeader>
                <PharmacyForm
                  pharmacy={selectedPharmacy}
                  onSubmit={handleSubmit}
                  onClose={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPharmacies?.map((pharmacy) => (
                <TableRow key={pharmacy.id}>
                  <TableCell>{pharmacy.name}</TableCell>
                  <TableCell>{getLocationAddress(pharmacy.locationId)}</TableCell>
                  <TableCell>{pharmacy.phone}</TableCell>
                  <TableCell>{pharmacy.email}</TableCell>
                  <TableCell>
                    <Badge variant={pharmacy.status === 'active' ? 'default' : 'secondary'}>
                      {pharmacy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPharmacy(pharmacy);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pharmacy.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Pharmacies;
