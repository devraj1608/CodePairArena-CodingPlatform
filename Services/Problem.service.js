import { toast } from 'react-hot-toast';

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ✅ Get all problems
export const getAllProblemsService = async () => {
  try {
    const response = await fetch(`${backendURL}/problems`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.status === 200) {
      // ✅ Fix: Return data directly if backend returns an array
      return data?.data || data;
    } else {
      toast.error('Server Error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching problems:', error);
    toast.error('Server Error');
    return [];
  }
};

// ✅ Get single problem by ID
export const getProblemService = async (id) => {
  try {
    const response = await fetch(`${backendURL}/problems/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.status === 200) {
      return data?.data || data;
    } else {
      toast.error('Problem not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching problem:', error);
    toast.error('Server Error');
    return null;
  }
};

// ✅ Update default language
export const updatedefaultlangService = async (lang) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/updatedefaultlang/${lang}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error updating default language:', error);
    toast.error('Server Error');
    return false;
  }
};

// ✅ Update template
export const updateTemplateService = async (lang, userData) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/updatetemplate/${lang}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.status === 200) {
      toast.success('Template Updated');
      return true;
    }

    toast.error('Login to update Template');
    return false;
  } catch (error) {
    console.error('Error updating template:', error);
    toast.error('Server Error');
    return false;
  }
};

// ✅ Get default language & template
export const getdefaultlangtempService = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backendURL}/users/getdeflangandtemplate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      return data?.data || data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching default language/template:', error);
    return null;
  }
};