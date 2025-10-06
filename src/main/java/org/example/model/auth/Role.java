package org.example.model.auth;

import java.util.HashSet;
import java.util.Set;

public enum Role{
	EMPLOYER("ROLE_EMPLOYER"),
    STUDENT("ROLE_STUDENT"),
	GESTIONNAIRE("ROLE_GESTIONNAIRE"),
	;

	private final String string;
	private final Set<Role> managedRoles = new HashSet<>();


	Role(String string){
		this.string = string;
	}

	@Override
	public String toString(){
		return string;
	}

}
