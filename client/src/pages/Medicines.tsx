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
import { useToast } from '@/hooks/use-toast';
import type { Medicine } from 'db/schema';

const MedicineForm = ({ medicine, onSubmit, onClose }: any) => {
  const [formData, setFormData] = useState(medicine || {
    name: '',
    category: '',
    description: '',
    price: '',
    manufacturer: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Medicine Name"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        placeholder="Category"
        value={formData.category}
        onChange={e => setFormData({ ...formData, category: e.target.value })}
        required
      />
      <Input
        placeholder="Description"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
      />
      <Input
        placeholder="Price"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={e => setFormData({ ...formData, price: e.target.value })}
        required
      />
      <Input
        placeholder="Manufacturer"
        value={formData.manufacturer}
        onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
      />
      <Button type="submit">
        {medicine ? 'Update Medicine' : 'Add Medicine'}
      </Button>
    </form>
  );
};

const Medicines = () => {
  const { data: medicines, mutate } = useSWR<Medicine[]>('/api/medicines');
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const filteredMedicines = medicines?.filter(medicine =>
    medicine.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/medicines', {
        method: selectedMedicine ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        mutate();
        toast({
          title: `Medicine ${selectedMedicine ? 'updated' : 'added'} successfully`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save medicine",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
        toast({
          title: "Medicine deleted successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medicine",
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
                placeholder="Search medicines..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedMedicine(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                  </DialogTitle>
                </DialogHeader>
                <MedicineForm
                  medicine={selectedMedicine}
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
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines?.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>{medicine.category}</TableCell>
                  <TableCell>${Number(medicine.price).toFixed(2)}</TableCell>
                  <TableCell>{medicine.manufacturer}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMedicine(medicine);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(medicine.id)}
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

export default Medicines;
