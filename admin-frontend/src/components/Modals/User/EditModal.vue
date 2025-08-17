<template>
    <div v-if="show" ref="modal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
        <div class="absolute inset-0 bg-black bg-opacity-50" aria-hidden="true" @click="handleBackdropClick"></div>

        <div class="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit User
                </h3>
                <button @click="$emit('closeModal')" type="button" class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <div class="p-4 md:p-5">
                <div class="space-y-4" >
                    <div>
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">User Name</label>
                        <input v-model="userData.name" type="text" name="name" id="name" placeholder="John Doe" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  />
                    </div>
                    <div>
                        <label for="role" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">User Role</label>
                        <select v-model="userData.role_id" id="created_at" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option value="1">Admin</option>
                            <option value="2">User</option>
                        </select>
                    </div>
                    <button @click="updateUser" type="button" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Update</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import {computed, ref} from "vue";
import Swal from "sweetalert2";
import {useUserStore} from "../../../store/UserStore.js";

const props = defineProps(['show', 'user', 'id'])
const emit = defineEmits(['closeModal'])
const userStore = useUserStore()
const userData = ref({
    'name':     props.user?.name,
    'role_id':  props.user?.role_id,
})
const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
        emit('closeModal')
    }
};

const updateUser = () => {
    userStore.updateUser(props.id, userData.value).then((res) => {
        if (res.data.success) {
            Swal.fire({
                text:               res.data.message,
                toast:              true,
                position:           'top-end',
                icon:               'success',
                timer:              3000,
                timerProgressBar:   true,
                showConfirmButton:  false
            });
            getUsers()
        } else {
            Swal.fire({
                text:               res.data.message,
                toast:              true,
                position:           'top-end',
                icon:               'error',
                timer:              3000,
                timerProgressBar:   true,
                showConfirmButton:  false
            });
        }
        emit('closeModal')
    })
}
const getUsers = () => {
    userStore.get({})
};
</script>

<style scoped>

</style>
