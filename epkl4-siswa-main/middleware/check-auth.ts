import { usePocketBaseClient } from '~/composables/pocketBaseClient'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const client = usePocketBaseClient()
  // If user model not yet loaded, skip redirect checks
  if (!client.authStore.model?.id) {
    return
  }
  // Determine collection based on role (students vs teachers)
  const role = client.authStore.model?.role
  const isTeacherUser = role && role !== 'siswa'
  const collection = isTeacherUser ? 'teacher_users' : 'student_users'
  // Refresh token only if we have a valid auth token; otherwise skip to avoid 401
  if (client.authStore.isValid) {
    try {
      await client.collection(collection).authRefresh()
    } catch (e) {
      // ignore refresh errors (including 401) – login page will handle redirection
    }
  }
  const isUserLoggedIn = await client.authStore.isValid
  const hasUser = !!client.authStore.model?.id

  // If there is no valid session, redirect to login (except when already on login)
  if (!hasUser || !isUserLoggedIn) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
  }
  // If a valid session exists and user tries to access login page, redirect to home
  if (hasUser && isUserLoggedIn && to.path === '/login') {
    return navigateTo('/')
  }
})
