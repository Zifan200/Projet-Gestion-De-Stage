package org.example.service;


import lombok.AllArgsConstructor;
import org.example.repository.EtudiantRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@AllArgsConstructor
@Service
public class CVService {
    private static final Logger logger = LoggerFactory.getLogger(CVService.class);
    @Autowired
    private final UserAppService userAppService;
    @Autowired
    private final EtudiantRepository studentRepository;


    public void addCv(String jwt, MultipartFile cvFile) {
        UserDTO userDTO = userAppService.getMe(jwt);
        studentRepository.findById(1212L).orElseThrow(UserNotFoundException::new);


        logger.info("{}",userAppService.getMe(jwt));
    }
}
