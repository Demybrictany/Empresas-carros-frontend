import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const fallbackError = "Ha ocurrido un error inesperado.";

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

export const success = (message = "Operacion realizada correctamente.", options = {}) =>
  toast.fire({
    icon: "success",
    title: message,
    timer: options.timer || 2500,
  });

export const error = (message) =>
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message || fallbackError,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#d33",
  });

export const warning = (message) =>
  Swal.fire({
    icon: "warning",
    title: "Atencion",
    text: message || "Debe completar todos los campos obligatorios.",
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#f59e0b",
  });

export const confirm = async (title, text, options = {}) => {
  const variant = options.variant || "warning";
  const isDelete = variant === "delete";
  const isDisable = variant === "disable";

  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Confirmar",
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: isDelete ? "#d33" : isDisable ? "#f59e0b" : "#3085d6",
    cancelButtonColor: "#6b7280",
  });

  return result.isConfirmed;
};

export const backendErrorMessage = (err) => err?.message || fallbackError;
