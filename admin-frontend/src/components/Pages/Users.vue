<template>
    <div class="relative overflow-x-auto">
        <div
            class="w-full text-sm text-left gap-4  rtl:text-right text-gray-500 dark:text-gray-400 grid grid-cols-12 mb-3">
            <div class="col-span-2 mt-8">
                <button @click="showCreateModal = true" :disabled="!isAdmin" type="button"
                        class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                    Create User
                </button>
            </div>
        </div>
        <CreateUserModal v-if="showCreateModal" @close-modal="closeCreateModal" :show="showCreateModal"
                         :key="showCreateModal"/>
        <EditUserModal v-if="showEditModal" :user="editableUserData" :id="editableUserId" @close-modal="closeEditModal"
                       :show="showEditModal" :key="editableUserData"/>
        <!-- Table -->
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <template v-for="(value, key) in userStore.users[0]" :key="key">
                    <th scope="col" class="px-6 py-3" v-if="key !== 'role'">
                        {{ formatTitle(key) }}
                    </th>
                </template>
                <th scope="col" class="px-6 py-3">
                    Actions
                </th>
            </tr>
            </thead>
            <tbody>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700" v-for="user in userStore.users"
                :key="user.id">
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ user?.id }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ user?.name ?? '-' }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ user?.email ?? '-' }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ user?.role_id == 1 ? 'Admin' : 'User' ?? '-' }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ formatDate(user?.createdAt) ?? '-' }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ formatDate(user?.updatedAt) ?? '-' }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded mr-2"
                            :disabled="!isAdmin" @click="openEditModal(user)">Edit
                    </button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                            :disabled="!isAdmin" @click="deleteUser(user.id)">Delete
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import Swal from "sweetalert2";
import { useUserStore } from '@/store/UserStore';
import {ref, onMounted, watch, computed} from 'vue';
import EditUserModal from "../Modals/User/EditModal.vue";
import CreateUserModal from "../Modals/User/CreateModal.vue";

const userStore = useUserStore();

const users = ref([]);

const editableUserData = {
    'name': '',
    'email': '',
    'role_id': '',
}

const filters = ref({
    status: '',
    created_at_order_type: '',
});
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editableUserId = ref(null);

const getUsers = () => {
    userStore.get(filters.value)
};

const isAdmin = computed(() => {
    return userStore.auth?.role_id === 1;
})
const formatTitle = (title) => {
    if (title === 'role_id') {
        return 'Role'
    }
    let result = title.replace(/_/g, ' ');
    return result.replace(/\b\w/g, char => char.toUpperCase());
}

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

const openEditModal = (user) => {
    showEditModal.value      = true
    editableUserId.value     = user.id
    editableUserData.name    = user.name
    editableUserData.email   = user.email
    editableUserData.role_id = user.role_id
}
const closeCreateModal = () => {
    showCreateModal.value = false;
};
const closeEditModal = () => {
    showEditModal.value = false;
};

const deleteUser = (id) => {
    Swal.fire({
        titleText: 'Are you sure you want to delete this user?',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Delete',
    }).then((res) => {
        if (res.isConfirmed) {
            userStore.deleteUser(id).then((res) => {
                if (res.data.success) {
                    Swal.fire({
                        text: res.data.message,
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                    getUsers()
                }
            })
        }
    })
}

onMounted(() => {
    getUsers();
    watch(showCreateModal, (newValue) => {
        document.body.style.overflow = newValue ? 'hidden' : '';
    });
    watch(showEditModal, (newValue) => {
        document.body.style.overflow = newValue ? 'hidden' : '';
    });
});
</script>
