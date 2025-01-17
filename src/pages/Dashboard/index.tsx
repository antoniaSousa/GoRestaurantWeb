import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);

  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const listFoods = await api.get('/foods');

      setFoods(listFoods.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const available = true;
      const newFood = { ...food, available };

      const addFoods = await api.post('/foods', newFood);

      const newFoodList = [...foods, addFoods.data];
      setFoods(newFoodList);

      setEditingFood(addFoods.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const updateFood = await api.put(`foods/${editingFood.id}`, food);

    const index = foods.findIndex(findFood => findFood.id === editingFood.id);
    foods[index] = updateFood.data;

    setFoods([...foods]);
  }
  async function handleDeleteFood(id: number): Promise<void> {
    const index = foods.findIndex(food => food.id === id);
    if (index < 0) {
      return;
    }
    await api.delete(`/foods/${id}`);
    let newFoods: IFoodPlate[] = [...foods];

    newFoods = foods.filter(food => food.id !== id);

    setFoods(newFoods);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    // TODO SET THE CURRENT EDITING FOOD ID IN THE STATE
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
