/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { GameCharacter, VoLamCharacter, Recipe } from '../../../types';

interface CraftingTabProps {
    character: GameCharacter;
}

const RecipeDetail = ({ recipe, inventoryMap, onCraft }: { recipe: Recipe, inventoryMap: Map<string, number>, onCraft: (recipe: Recipe) => void }) => {
    const canCraft = useMemo(() => {
        return recipe.materials.every(material => (inventoryMap.get(material.name) || 0) >= material.quantity);
    }, [recipe, inventoryMap]);

    return (
        <div className="recipe-detail-container">
            <h5 className="recipe-detail-title">{recipe.name}</h5>
            <p className="recipe-detail-desc">{recipe.description}</p>
            
            <h6>Nguyên Liệu Cần Thiết</h6>
            <ul className="materials-list">
                {recipe.materials.map(material => {
                    const have = inventoryMap.get(material.name) || 0;
                    const lacking = have < material.quantity;
                    return (
                        <li key={material.itemId} className={`material-item ${lacking ? 'lacking' : ''}`}>
                            <span>{material.name}</span>
                            <span>{have} / {material.quantity}</span>
                        </li>
                    );
                })}
            </ul>

            <h6>Vật Phẩm Đầu Ra</h6>
            <div className="output-item-display">
                <strong>{recipe.output.name}</strong> x{recipe.output.quantity}
                <p>{recipe.output.description}</p>
            </div>

            <button className="craft-button" onClick={() => onCraft(recipe)} disabled={!canCraft}>
                Chế Tạo
            </button>
        </div>
    );
};


export const CraftingTab = ({ character }: CraftingTabProps) => {
    const { dispatch } = useGameContext();
    const voLamChar = character as VoLamCharacter;
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    const { alchemyRecipes, forgingRecipes, inventoryMap } = useMemo(() => {
        const recipes = voLamChar.learnedRecipes || [];
        const invMap = new Map<string, number>(voLamChar.inventory.map(item => [item.name, item.quantity]));
        return {
            alchemyRecipes: recipes.filter(r => r.type === 'Alchemy'),
            forgingRecipes: recipes.filter(r => r.type === 'Forging'),
            inventoryMap: invMap,
        };
    }, [voLamChar.learnedRecipes, voLamChar.inventory]);

    const selectedRecipe = useMemo(() => {
        return (voLamChar.learnedRecipes || []).find(r => r.id === selectedRecipeId);
    }, [selectedRecipeId, voLamChar.learnedRecipes]);

    const handleCraft = (recipe: Recipe) => {
        dispatch({ type: 'CRAFT_ITEM', payload: { characterId: character.id, recipe } });
    };

    if (!voLamChar.learnedRecipes || voLamChar.learnedRecipes.length === 0) {
        return <NoInfoPlaceholder text="Bạn chưa học được công thức nào." />;
    }

    const renderRecipeList = (recipes: Recipe[], title: string) => (
        <div className="recipe-list-container">
            <h4>{title}</h4>
            {recipes.length > 0 ? (
                <ul className="recipe-list">
                    {recipes.map(recipe => (
                        <li key={recipe.id}>
                            <button
                                className={`recipe-item-button ${selectedRecipeId === recipe.id ? 'active' : ''}`}
                                onClick={() => setSelectedRecipeId(recipe.id)}
                            >
                                {recipe.name}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : <NoInfoPlaceholder text="Chưa có công thức."/>}
        </div>
    );

    return (
        <div className="char-detail-section crafting-container">
            <div className="recipe-list-section">
                {renderRecipeList(alchemyRecipes, 'Luyện Đan')}
                {renderRecipeList(forgingRecipes, 'Rèn Đúc')}
            </div>
            <div className="recipe-detail-section">
                {selectedRecipe ? (
                    <RecipeDetail recipe={selectedRecipe} inventoryMap={inventoryMap} onCraft={handleCraft} />
                ) : (
                    <NoInfoPlaceholder text="Chọn một công thức để xem chi tiết." />
                )}
            </div>
        </div>
    );
};