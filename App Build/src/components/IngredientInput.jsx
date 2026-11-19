export default function IngredientInput({ value, onChange, onCheck }) {
  const submit = (e) => {
    e.preventDefault()
    onCheck()
  }

  return (
    <form className="card input" onSubmit={submit}>
      <label htmlFor="ingredients">Ingredients</label>
      <textarea
        id="ingredients"
        rows={5}
        placeholder="Paste an ingredient list, e.g. Whey protein, sugar, peanut oil, soy lecithin"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit">Check</button>
    </form>
  )
}
