const eliminarBtn = document.querySelectorAll('.eliminar');
eliminarBtn.forEach(button => button.addEventListener('click', llamadaDelete))

function llamadaDelete(e) {
  console.log(e.target)
  return fetch(`/delete/${e.target.dataset.tla}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
}