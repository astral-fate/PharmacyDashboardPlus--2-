import React, { useState } from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertTriangle } from 'lucide-react';
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
import type { Inventory, Medicine, Pharmacy } from 'db/schema';

const InventoryForm = ({ onSubmit, onClose }: any) => {
  const { data: medicines } = useSWR<Medicine[]>('/api/medicines');
  const { data: pharmacies } = useSWR<Pharmacy[]>('/api/pharmacies');
  const [formData, setFormData] = useState({
    medicineId: '',
    pharmacyId: '',
    quantity: '',
    minQuantity: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        className="w-full p-2 border rounded"
        value={formData.medicineId}
        onChange={e => setFormData({ ...formData, medicineId: e.target.value })}
        required
      >
        <option value="">Select Medicine</option>
        {medicines?.map(medicine => (
          <option key={medicine.id} value={medicine.id}>
            {medicine.name}
          </option>
        ))}
      </select>
      <select
        className="w-full p-2 border rounded"
        value={formData.pharmacyId}
        onChange={e => setFormData({ ...formData, pharmacyId: e.target.value })}
        required
      >
        <option value="">Select Pharmacy</option>
        {pharmacies?.map(pharmacy => (
          <option key={pharmacy.id} value={pharmacy.id}>
            {pharmacy.name}
          </option>
        ))}
      </select>
      <Input
        placeholder="Quantity"
        type="number"
        value={formData.quantity}
        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
        required
      />
      <Input
        placeholder="Minimum Quantity"
        type="number"
        value={formData.minQuantity}
        onChange={e => setFormData({ ...formData, minQuantity: e.target.value })}
        required
      />
      <Button type="submit">Update Inventory</Button>
    </form>
  );
};

const Inventory = () => {
  const { data: inventory, mutate } = useSWR<Inventory[]>('/api/inventory');
  const { data: medicines } = useSWR<Medicine[]>('/api/medicines');
  const { data: pharmacies } = useSWR<Pharmacy[]>('/api/pharmacies');
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const getMedicineName = (id: number) => {
    return medicines?.find(m => m.id === id)?.name || 'Unknown';
  };

  const getPharmacyName = (id: number) => {
    return pharmacies?.find(p => p.id === id)?.name || 'Unknown';
  };

  const filteredInventory = inventory?.filter(item =>
    getMedicineName(item.medicineId).toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        mutate();
        toast({
          title: "Inventory updated successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update inventory",
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
                placeholder="Search inventory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Update Inventory
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Inventory</DialogTitle>
                </DialogHeader>
                <InventoryForm
                  onSubmit={handleSubmit}
                  onClose={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{getMedicineName(item.medicineId)}</TableCell>
                  <TableCell>{getPharmacyName(item.pharmacyId)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.quantity < item.minQuantity ? (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Low Stock</span>
                      </Badge>
                    ) : (
                      <Badge variant="default">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(item.lastUpdated).toLocaleDateString()}
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

export default Inventory;
